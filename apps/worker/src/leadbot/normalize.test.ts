import assert from "node:assert/strict";
import test from "node:test";
import {
  corporateNumberCheckDigitValid,
  isDomainKeyEligible,
  isPhoneKeyEligible,
  normalizeAddressKey,
  normalizeCorporateNumber,
  normalizeDomain,
  normalizeNameKey,
  normalizePhone,
} from "./normalize.js";

test("corporate number normalisation and check digit", () => {
  assert.equal(normalizeCorporateNumber("501-0401-00048-5"), "5010401000485");
  assert.equal(normalizeCorporateNumber("1234"), null);
  assert.equal(corporateNumberCheckDigitValid("5010401000485"), true);
  assert.equal(corporateNumberCheckDigitValid("5010401000484"), false);
});

test("phone normalisation and key eligibility", () => {
  assert.equal(normalizePhone("03-1234-5678"), "+81312345678");
  assert.equal(normalizePhone("not a phone"), null);
  assert.equal(isPhoneKeyEligible("+81312345678"), true);
  assert.equal(isPhoneKeyEligible("+81120123456"), false);
  assert.equal(isPhoneKeyEligible("+818001234567"), false);
  assert.equal(isPhoneKeyEligible("+815012345678"), false);
});

test("domain normalisation and platform exclusion", () => {
  assert.equal(normalizeDomain("https://www.Example.co.jp/path?a=1"), "example.co.jp");
  assert.equal(normalizeDomain("http://foo.wixsite.com/site"), "foo.wixsite.com");
  assert.equal(isDomainKeyEligible("example.co.jp"), true);
  assert.equal(isDomainKeyEligible("foo.wixsite.com"), false);
  assert.equal(isDomainKeyEligible("someone.line.me"), false);
});

test("name and address keys are normalised", () => {
  assert.equal(normalizeNameKey("株式会社税理士法人 東京 事務所"), "東京事務所");
  assert.equal(normalizeNameKey("カタカナ商事"), "かたかな商事");
  assert.equal(normalizeAddressKey("東京都千代田区一丁目1番2号"), "東京都千代田区1丁目");
});
