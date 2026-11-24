import { SubmitButton } from "@/ui";

export function ActivityForm({
  leadId,
  action,
}: {
  leadId: string;
  action: (formData: FormData) => Promise<void>;
}) {
  return (
    <form action={action} className="lead-activity-form">
      <input type="hidden" name="leadId" value={leadId} />
      <label className="field">
        <span>Note</span>
        <textarea name="note" required />
      </label>
      <label className="field">
        <span>Next step</span>
        <input name="nextStep" />
      </label>
      <label className="field">
        <span>Next date</span>
        <input name="nextStepDate" type="date" />
      </label>
      <SubmitButton>Add activity</SubmitButton>
    </form>
  );
}
