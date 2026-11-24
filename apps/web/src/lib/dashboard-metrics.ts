import { tierForScore } from "@/lib/lead-view";

export type DashboardLeadRow = {
  id: string;
  company: string;
  stage: string;
  score: number;
  nextStep: string | null;
  nextStepDate: string | null;
};

export type DashboardActivityRow = {
  id: string;
  company: string;
  note: string;
  createdAt: Date;
};

export type DashboardSnapshotInput = {
  leads: DashboardLeadRow[];
  contactRequests: { id: string; leadId: string | null }[];
  documents: { id: string }[];
  posts: { id: string; status: string }[];
  activities: DashboardActivityRow[];
  now?: Date;
};

export type DashboardFocusItem = {
  lead: DashboardLeadRow;
  tier: ReturnType<typeof tierForScore>;
  overdue: boolean;
};

export type DashboardActivityItem = {
  id: string;
  company: string;
  note: string;
  date: string;
};

function isOverdueLead(lead: DashboardLeadRow, today: string): boolean {
  return (
    lead.nextStepDate !== null &&
    lead.stage !== "won" &&
    lead.stage !== "lost" &&
    lead.nextStepDate < today
  );
}

export function computeDashboardSnapshot({
  leads,
  contactRequests,
  documents,
  posts,
  activities,
  now = new Date(),
}: DashboardSnapshotInput) {
  const today = now.toISOString().slice(0, 10);
  const focusLeads = leads
    .filter((lead) => lead.stage === "new" || isOverdueLead(lead, today))
    .sort((left, right) => {
      const leftOverdue = isOverdueLead(left, today) ? 0 : 1;
      const rightOverdue = isOverdueLead(right, today) ? 0 : 1;
      if (leftOverdue !== rightOverdue) return leftOverdue - rightOverdue;
      if (right.score !== left.score) return right.score - left.score;
      return left.company.localeCompare(right.company);
    })
    .slice(0, 4);

  return {
    totalLeads: leads.length,
    tierA: leads.filter((lead) => tierForScore(lead.score) === "A").length,
    overdue: leads.filter((lead) => isOverdueLead(lead, today)).length,
    unpromotedRequests: contactRequests.filter((request) => request.leadId === null).length,
    documentCount: documents.length,
    publishedPosts: posts.filter((post) => post.status === "published").length,
    totalPosts: posts.length,
    focusQueue: focusLeads.map<DashboardFocusItem>((lead) => ({
      lead,
      tier: tierForScore(lead.score),
      overdue: isOverdueLead(lead, today),
    })),
    recentActivity: activities.slice(0, 4).map<DashboardActivityItem>((activity) => ({
      id: activity.id,
      company: activity.company,
      note: activity.note,
      date: activity.createdAt.toISOString().slice(0, 10),
    })),
  };
}
