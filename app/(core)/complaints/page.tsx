"use client";

import { useMemo, useState } from "react";
import { Bot, MessageSquareWarning } from "lucide-react";

import type { Complaint } from "@/lib/mockData";
import { mockComplaints } from "@/lib/mockData";
import { ComplaintCard } from "@/components/ComplaintCard";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AnimatedCard } from "@/components/aceternity/AnimatedCard";
import { AnimatedText } from "@/components/aceternity/AnimatedText";
import { Spotlight } from "@/components/aceternity/Spotlight";

function nowISTLabel() {
  // lightweight, readable demo timestamp
  const d = new Date();
  return d
    .toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    })
    .replace(",", "")
    .replace(/\s(am|pm)$/i, (m) => ` ${m.toUpperCase()} IST`);
}

function classifyComplaint(text: string): Pick<Complaint, "aiCategory" | "aiSeverity" | "aiResponsePreview"> {
  const t = text.toLowerCase();

  const hasDelay = /delay|late|pending|stuck|not moving/.test(t);
  const hasDamage = /damage|broken|torn|tamper|opened/.test(t);
  const hasAddress = /address|digipin|pin code|pincode|wrong route|reroute/.test(t);
  const hasAttempt = /attempt|call|ring|missed|not available|deliver after/.test(t);
  const hasRefund = /refund|charge|fee|payment/.test(t);

  let aiCategory: Complaint["aiCategory"] = "Other";
  if (hasDamage) aiCategory = "Damage / Tamper";
  else if (hasRefund) aiCategory = "Refund / Charges";
  else if (hasAddress) aiCategory = "Address / Routing";
  else if (hasAttempt) aiCategory = "Delivery Attempt";
  else if (hasDelay) aiCategory = "Delay / SLA";

  const urgencySignals = /urgent|medical|passport|exam|immediately|today/.test(t);
  const aiSeverity: Complaint["aiSeverity"] = urgencySignals || hasDamage ? "High" : hasDelay ? "Medium" : "Low";

  const aiResponsePreview =
    aiCategory === "Delay / SLA"
      ? "We understand the inconvenience. We are checking the latest hub scans and congestion/weather signals. A revised ETA will be shared after the next scan update."
      : aiCategory === "Delivery Attempt"
        ? "Your delivery preference has been recorded. The destination office will be notified to attempt delivery accordingly, subject to route schedule."
        : aiCategory === "Address / Routing"
          ? "We have flagged this for address verification and routing correction. Please confirm the DIGIPIN/landmark details so the destination office can act quickly."
          : aiCategory === "Damage / Tamper"
            ? "We are sorry to hear this. Please retain the packaging and share photos if available. The case will be escalated for inspection and resolution."
            : aiCategory === "Refund / Charges"
              ? "We have recorded the billing concern and will verify service charges against the article type and service level. Updates will be shared shortly."
              : "Your complaint has been registered. Our support team will review the details and respond with the next steps.";

  return { aiCategory, aiSeverity, aiResponsePreview };
}

export default function ComplaintsPage() {
  const [trackingId, setTrackingId] = useState("IPXK9A72IN");
  const [summary, setSummary] = useState("Parcel delayed beyond expected window");
  const [description, setDescription] = useState(
    "Tracking shows hub processing for several hours. Please confirm revised ETA and reason.",
  );
  const [preferredCategory, setPreferredCategory] = useState<Complaint["aiCategory"]>(
    "Delay / SLA",
  );

  const [localComplaints, setLocalComplaints] = useState<Complaint[]>([]);

  const ai = useMemo(
    () => classifyComplaint(`${summary}\n${description}`),
    [summary, description],
  );

  const combined = useMemo(() => {
    const all = [...localComplaints, ...mockComplaints];
    return all.sort((a, b) => (a.submittedAt < b.submittedAt ? 1 : -1));
  }, [localComplaints]);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 relative overflow-hidden">
      {/* Spotlight background effect */}
      <Spotlight className="top-0 right-0 opacity-20" />
      
      {/* Official case files header */}
      <div className="daksh-sticky-header relative z-10">
        <AnimatedText type="fade" delay={0}>
          <div className="daksh-kicker mb-2">Citizen Grievance System</div>
        </AnimatedText>
        <AnimatedText type="slide" delay={100}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-md daksh-gradient-primary daksh-layered aceternity-float">
              <MessageSquareWarning className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="daksh-text-primary text-3xl aceternity-gradient-text">
              Complaint System (AI-assisted)
            </h1>
          </div>
        </AnimatedText>
        <AnimatedText type="fade" delay={200}>
          <p className="daksh-text-secondary max-w-2xl">
            Submit a complaint. The system auto-classifies category and severity and generates a response preview.
          </p>
        </AnimatedText>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2 relative z-10">
        <AnimatedCard className="daksh-layered-elevated daksh-gradient-card rounded-lg overflow-hidden aceternity-border-gradient" delay={300}>
          <div className="daksh-layered border-b p-5 daksh-gradient-muted">
            <div className="daksh-text-label mb-1">Submit Complaint</div>
            <div className="daksh-text-secondary text-xs">Official case file form</div>
          </div>
          <div className="p-5">
            <form
              className="grid gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                const id = `CMP-${Math.floor(10000 + Math.random() * 89999)}`;
                const aiComputed = classifyComplaint(`${summary}\n${description}`);

                const newComplaint: Complaint = {
                  id,
                  trackingId: trackingId.trim().toUpperCase(),
                  submittedAt: nowISTLabel(),
                  summary: summary.trim(),
                  description: description.trim(),
                  aiCategory: aiComputed.aiCategory,
                  aiSeverity: aiComputed.aiSeverity,
                  aiResponsePreview: aiComputed.aiResponsePreview,
                  status: "Open",
                };

                setLocalComplaints((prev) => [newComplaint, ...prev]);
              }}
            >
              <div className="grid gap-2">
                <label className="text-sm font-medium" htmlFor="tracking">Tracking ID</label>
                <Input
                  id="tracking"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  placeholder="e.g., IPXK9A72IN"
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium">Citizen-selected category (optional)</label>
                <Select
                  value={preferredCategory}
                  onValueChange={(v) => setPreferredCategory(v as Complaint["aiCategory"])}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Delay / SLA">Delay / SLA</SelectItem>
                    <SelectItem value="Delivery Attempt">Delivery Attempt</SelectItem>
                    <SelectItem value="Address / Routing">Address / Routing</SelectItem>
                    <SelectItem value="Damage / Tamper">Damage / Tamper</SelectItem>
                    <SelectItem value="Refund / Charges">Refund / Charges</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <div className="text-xs text-muted-foreground">
                  The AI classification is independent; citizen selection is used as a hint.
                </div>
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium" htmlFor="summary">Summary</label>
                <Input
                  id="summary"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Short title" 
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium" htmlFor="desc">Description</label>
                <Textarea
                  id="desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the issue clearly" 
                  rows={5}
                />
              </div>

              <Button 
                type="submit" 
                className="bg-primary hover:bg-primary/90 daksh-elevated daksh-focus-ring daksh-press w-full"
              >
                Submit complaint
              </Button>
            </form>
          </div>
        </AnimatedCard>

        <AnimatedCard className="daksh-layered-elevated daksh-gradient-card rounded-lg overflow-hidden daksh-intelligence-panel aceternity-glow" delay={400}>
          <div className="daksh-layered border-b p-5 daksh-gradient-muted">
            <div className="flex items-center gap-2.5 mb-1">
              <div className="p-1.5 rounded-md daksh-gradient-primary daksh-layered">
                <Bot className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="daksh-text-label">AI Triage Preview</div>
            </div>
            <div className="daksh-text-secondary text-xs">Mock classification</div>
          </div>
          <div className="p-5 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="daksh-status-indicator">
                Citizen hint: {preferredCategory}
              </Badge>
              <Badge
                variant={ai.aiSeverity === "High" ? "destructive" : ai.aiSeverity === "Medium" ? "default" : "secondary"}
                className="daksh-status-indicator"
              >
                AI severity: {ai.aiSeverity}
              </Badge>
              <Badge variant="secondary" className="daksh-status-indicator">
                AI category: {ai.aiCategory}
              </Badge>
            </div>

            <div className="daksh-advisory daksh-layered rounded-lg p-4">
              <div className="daksh-text-label mb-2">Auto-response Preview</div>
              <p className="daksh-text-secondary leading-relaxed">{ai.aiResponsePreview}</p>
            </div>

            <div className="daksh-text-meta">
              In production, this response would be reviewed by an operator and logged with an audit trail.
            </div>
          </div>
        </AnimatedCard>
      </div>

      <div className="mt-10 daksh-slide-up">
        <div className="daksh-sticky-header mb-6">
          <div className="daksh-rule" />
          <div className="mt-4">
            <div className="daksh-kicker mb-2">Case Files Register</div>
            <div className="daksh-text-secondary">Recent submissions and AI classification tags</div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {combined.map((c, idx) => (
            <div key={c.id} className="daksh-fade-in" style={{ animationDelay: `${idx * 50}ms` }}>
              <ComplaintCard complaint={c} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
