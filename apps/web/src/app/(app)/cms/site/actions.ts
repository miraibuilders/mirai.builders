"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { caseStudies, getDb, pricingTiers, siteSettings } from "@mirai/db";
import { requireCmsAdmin } from "@/lib/cms-auth";
import { saveSiteImage } from "@/lib/site-images";
import type { SiteFormErrors, SiteFormState } from "./form-state";

function text(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  if (typeof value !== "string") return null;
  return value.trim() === "" ? null : value;
}

function optionalText(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  return typeof value === "string" ? value : null;
}

function uploadedFile(formData: FormData, key: string): File | null {
  const value = formData.get(key);
  return value instanceof File && value.size > 0 ? value : null;
}

function integerField(formData: FormData, key: string): number | null {
  const value = text(formData, key);
  if (value === null) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && Number.isInteger(parsed) ? parsed : null;
}

export async function saveSiteSettings(
  _previous: SiteFormState,
  formData: FormData,
): Promise<SiteFormState> {
  const actor = await requireCmsAdmin();
  const errors: SiteFormErrors = {};

  const phone = text(formData, "phone");
  const heroHeadlineJa = text(formData, "heroHeadlineJa");
  const offerNameJa = text(formData, "offerNameJa");
  const offerPrice = integerField(formData, "offerPrice");

  if (!phone) errors.phone = "PHONE_REQUIRED";
  if (!heroHeadlineJa) errors.heroHeadlineJa = "HERO_HEADLINE_JA_REQUIRED";
  if (!offerNameJa) errors.offerNameJa = "OFFER_NAME_JA_REQUIRED";
  if (offerPrice === null) errors.offerPrice = "OFFER_PRICE_REQUIRED";

  const imageFields = [
    { field: "heroImage", url: "heroImageUrl", width: "heroImageWidth", height: "heroImageHeight" },
    {
      field: "authorImage",
      url: "aboutAuthorImageUrl",
      width: "aboutAuthorImageWidth",
      height: "aboutAuthorImageHeight",
    },
  ];
  const uploads: Record<string, { url: string; width: number; height: number }> = {};
  for (const target of imageFields) {
    const file = uploadedFile(formData, target.field);
    if (!file) continue;
    const result = await saveSiteImage(file);
    if (!result.ok) {
      errors[target.field] = result.error;
    } else {
      uploads[target.field] = { url: result.url, width: result.width, height: result.height };
    }
  }

  const caseCount = formData.getAll("caseSortOrder").length;
  const caseUploads: Record<number, { url: string; width: number; height: number }> = {};
  for (let index = 0; index < caseCount; index += 1) {
    const file = uploadedFile(formData, `caseImage_${index}`);
    if (!file) continue;
    const result = await saveSiteImage(file);
    if (!result.ok) {
      errors[`caseImage_${index}`] = result.error;
    } else {
      caseUploads[index] = { url: result.url, width: result.width, height: result.height };
    }
  }

  if (Object.keys(errors).length > 0) {
    return {
      status: "error",
      message: Object.values(errors)[0] ?? "VALIDATION_FAILED",
      errors,
    };
  }

  const heroUpload = uploads.heroImage ?? {
    url: optionalText(formData, "heroImageUrl"),
    width: integerField(formData, "heroImageWidth"),
    height: integerField(formData, "heroImageHeight"),
  };
  const authorUpload = uploads.authorImage ?? {
    url: optionalText(formData, "aboutAuthorImageUrl"),
    width: integerField(formData, "aboutAuthorImageWidth"),
    height: integerField(formData, "aboutAuthorImageHeight"),
  };

  const values = {
    phone,
    emailJa: text(formData, "emailJa"),
    emailEn: text(formData, "emailEn"),
    addressJa: text(formData, "addressJa"),
    addressEn: text(formData, "addressEn"),
    heroHeadlineJa,
    heroHeadlineEn: text(formData, "heroHeadlineEn"),
    heroSubheadlineJa: text(formData, "heroSubheadlineJa"),
    heroSubheadlineEn: text(formData, "heroSubheadlineEn"),
    heroCtaJa: text(formData, "heroCtaJa"),
    heroCtaEn: text(formData, "heroCtaEn"),
    heroImageUrl: heroUpload.url,
    heroImageWidth: heroUpload.width,
    heroImageHeight: heroUpload.height,
    heroImageAltJa: text(formData, "heroImageAltJa"),
    offerNameJa,
    offerNameEn: text(formData, "offerNameEn"),
    offerDescriptionJa: text(formData, "offerDescriptionJa"),
    offerDescriptionEn: text(formData, "offerDescriptionEn"),
    offerPrice,
    aboutAuthorNameJa: text(formData, "aboutAuthorNameJa"),
    aboutAuthorNameEn: text(formData, "aboutAuthorNameEn"),
    aboutAuthorBioJa: text(formData, "aboutAuthorBioJa"),
    aboutAuthorBioEn: text(formData, "aboutAuthorBioEn"),
    aboutAuthorImageUrl: authorUpload.url,
    aboutAuthorImageWidth: authorUpload.width,
    aboutAuthorImageHeight: authorUpload.height,
    footerCopyrightJa: text(formData, "footerCopyrightJa"),
    footerCopyrightEn: text(formData, "footerCopyrightEn"),
    updatedAt: new Date(),
    updatedBy: actor.userId,
  };

  const tierNamesJa = formData.getAll("tierNameJa");
  const tiers = tierNamesJa.map((nameJa, index) => ({
    id: randomUUID(),
    nameJa: typeof nameJa === "string" && nameJa.trim() ? nameJa : null,
    nameEn: text(formData, `tierNameEn_${index}`),
    price: text(formData, `tierPrice_${index}`),
    noteJa: text(formData, `tierNoteJa_${index}`),
    noteEn: text(formData, `tierNoteEn_${index}`),
    sortOrder: integerField(formData, `tierSortOrder_${index}`) ?? index,
    createdAt: new Date(),
  }));

  const caseStatuses = formData.getAll("caseStatus");
  const caseRows = caseStatuses.map((status, index) => {
    const upload = caseUploads[index] ?? {
      url: optionalText(formData, `caseImageUrl_${index}`),
      width: integerField(formData, `caseImageWidth_${index}`),
      height: integerField(formData, `caseImageHeight_${index}`),
    };
    const requested = typeof status === "string" ? status : "draft";
    return {
      id: randomUUID(),
      status: requested === "published" ? "published" : "draft",
      metaJa: text(formData, `caseMetaJa_${index}`),
      metaEn: text(formData, `caseMetaEn_${index}`),
      titleJa: text(formData, `caseTitleJa_${index}`),
      titleEn: text(formData, `caseTitleEn_${index}`),
      summaryJa: text(formData, `caseSummaryJa_${index}`),
      summaryEn: text(formData, `caseSummaryEn_${index}`),
      imageUrl: upload.url,
      imageWidth: upload.width,
      imageHeight: upload.height,
      sortOrder: integerField(formData, `caseSortOrder_${index}`) ?? index,
      createdAt: new Date(),
    };
  });

  const db = getDb();
  await db
    .insert(siteSettings)
    .values(values)
    .onConflictDoUpdate({
      target: siteSettings.id,
      set: values,
    });
  await db.delete(pricingTiers);
  await db.delete(caseStudies);
  if (tiers.length > 0) await db.insert(pricingTiers).values(tiers);
  if (caseRows.length > 0) await db.insert(caseStudies).values(caseRows);

  revalidatePath("/");
  revalidatePath("/llms.txt");
  revalidatePath("/cms");
  revalidatePath("/cms/site");
  redirect("/cms/site?notice=Site%20settings%20saved");
}
