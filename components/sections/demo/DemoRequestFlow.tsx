"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { AiSalesCall } from "@/components/sections/demo/AiSalesCall";
import { DemoTrustBand } from "@/components/sections/demo/DemoTrustBand";
import { DemoVideo } from "@/components/sections/demo/DemoVideo";
import { BASE_LEVEL, TOP_LEVEL, formatDollars } from "@/lib/pricing";
import {
  WHITE_GLOVE_MONTHLY_DOLLARS,
  WHITE_GLOVE_INITIAL_MONTHS,
} from "@/lib/white-glove";

import {
  DEMO_OPTIONS,
  EMPTY_DEMO,
  isSelfServe,
  type DemoAnswers as Answers,
} from "@/lib/demo-qualification";
const price = `$${WHITE_GLOVE_MONTHLY_DOLLARS.toLocaleString("en-US")}`;
const routesToSelfServe = isSelfServe;
export default function DemoRequestFlow() {
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<Answers>(EMPTY_DEMO);
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const submissionId = useRef<string>("");
  const inFlight = useRef(false);
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  const [talking, setTalking] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    heading.current?.focus();
  }, [step, submitted]);
  function field(
    key: keyof Answers,
    label: string,
    options?: readonly string[],
    type = "text",
  ) {
    const props = {
      id: `request-${key}`,
      name: key,
      required: true,
      value: answers[key],
      onChange: (
        e: React.ChangeEvent<
          HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >,
      ) => {
        submissionId.current = "";
        setAnswers((a) => ({ ...a, [key]: e.target.value }));
      },
      className: "demo-form__input",
    };
    return (
      <div className="demo-form__field">
        <label className="demo-form__label" htmlFor={props.id}>
          {label}
        </label>
        {options ? (
          <select {...props}>
            <option value="" disabled>
              Select an option
            </option>
            {options.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        ) : key === "goal" ? (
          <textarea {...props} maxLength={2000} rows={3} />
        ) : (
          <input
            {...props}
            type={type}
            pattern={key === "website" ? "https?://.+" : undefined}
            maxLength={250}
            autoComplete={
              key === "email"
                ? "email"
                : key === "name"
                  ? "name"
                  : key === "website"
                    ? "url"
                    : "organization-title"
            }
          />
        )}
      </div>
    );
  }
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (step === 1) {
      setStep(2);
      return;
    }
    if (inFlight.current) return;
    // Low budgets do not create a sales request or consume enrichment.
    if (isSelfServe(answers)) {
      setSubmitted("self_serve");
      return;
    }
    inFlight.current = true;
    setPending(true);
    setError("");
    if (!submissionId.current) submissionId.current = crypto.randomUUID();
    try {
      const response = await fetch("/api/demo-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...answers,
          submissionId: submissionId.current,
          nickname:
            new FormData(e.currentTarget as HTMLFormElement).get("nickname") ??
            "",
        }),
        signal: AbortSignal.timeout(25000),
      });
      const result = await response.json();
      if (
        !response.ok ||
        result.ok !== true ||
        !["review", "self_serve"].includes(result.route)
      )
        throw new Error(
          result.error || "We could not save your request. Please try again.",
        );
      setSubmitted(result.route);
    } catch (err) {
      setError(
        err instanceof Error && err.name !== "TimeoutError"
          ? err.message
          : "The request timed out. Please retry; your request will not be duplicated.",
      );
    } finally {
      inFlight.current = false;
      setPending(false);
    }
  }
  return (
    <main id="main-content" className="lp lp-demo request-preview">
      <header className="request-nav">
        <a href="/" aria-label="Pancake home">
          <img
            src="/lp/lp-nav-logo.svg"
            alt="Pancake"
            width={115}
            height={56}
          />
        </a>
        <span>Let’s build your GTM factory.</span>
      </header>
      <section className="request-layout">
        <div className="request-brand-left">
          <div className="request-brand-pitch">
            <p className="request-brand-eyebrow">Now in early access</p>
            <h1 className="lp-display request-brand-title">
              Put your GTM on{" "}
              <br />
              full autopilot
            </h1>
            <p className="request-brand-lede">
              Pancake lets your Claude or ChatGPT run your{" "}
              <span className="demo-nowrap">go-to-market</span>. Find people ready
              to buy and start outreach campaigns from the same conversation.
            </p>
          </div>
          <DemoTrustBand />
        </div>
        <section className="request-card" aria-labelledby="request-title">
          {submitted && routesToSelfServe(answers) ? (
            <div className="request-success">
              {talking && (
                <AiSalesCall
                  known={{}}
                  sent={false}
                  returnsTo="demo"
                  onFormAnswers={async () => ({
                    ok: false,
                    field: "team_size",
                    message:
                      "This visitor is on the self-service path with a budget below $350 per month. Answer product questions and help them start using Pancake. Do not offer a sales meeting or calendar.",
                  })}
                  onSlot={() => ({
                    ok: false,
                    message:
                      "Booking is unavailable on this self-service path. Guide the visitor to Start with Pancake.",
                  })}
                  onClose={() => setTalking(false)}
                />
              )}
              <span className="request-badge">Your next step · self-serve</span>
              <h2
                ref={heading}
                tabIndex={-1}
                id="request-title"
                className="lp-display"
              >
                Get started with Pancake.
              </h2>
              <p>
                For your budget, self-serve is the best place to start. Watch
                the walkthrough, then ask Juicy anything about setting up your
                first Play.
              </p>
              <DemoVideo />
              <div className="request-actions">
                <a
                  className="lp-btn lp-btn--primary"
                  href="https://app.pancake.ai/signup"
                >
                  Start with Pancake →
                </a>
                <button
                  className="lp-btn lp-btn--primary"
                  onClick={() => setTalking(true)}
                >
                  Talk to Juicy
                </button>
              </div>
              <p className="request-fine">
                Juicy is our AI assistant. No sales meeting is requested.
              </p>
              <button
                className="preview-link"
                onClick={() => {
                  setSubmitted(null);
                  setStep(2);
                  setTalking(false);
                }}
              >
                Change answers
              </button>
            </div>
          ) : submitted ? (
            <div className="request-success">
              <span className="request-badge">Request received</span>
              <h2
                ref={heading}
                tabIndex={-1}
                id="request-title"
                className="lp-display"
              >
                Thanks, {answers.name.split(" ")[0]}.
              </h2>
              <p>
                We’ll review your company and what you’re looking to achieve. If
                there’s a fit, we’ll send a booking invitation to{" "}
                <strong>{answers.email}</strong>.
              </p>
              <p>No meeting is booked yet.</p>
              <div className="request-offer">
                <strong>Want to explore while you wait?</strong>
                <p>You can try Pancake on your own.</p>
                <a href="https://app.pancake.ai/signup">Explore Pancake →</a>
              </div>
              <button
                className="preview-link"
                onClick={() => {
                  setSubmitted(null);
                  setStep(1);
                  setAnswers(EMPTY_DEMO);
                  submissionId.current = "";
                }}
              >
                Submit another request
              </button>
            </div>
          ) : (
            <form onSubmit={submit}>
              <div className="lp-sr-only" aria-hidden="true">
                <label>
                  Leave empty
                  <input name="nickname" tabIndex={-1} autoComplete="off" />
                </label>
              </div>
              <fieldset disabled={pending} className="demo-form__group">
                <span className="request-eyebrow">
                  {step === 1 ? "01 / 02 · Your team" : "02 / 02 · Your goals"}
                </span>
                <h2
                  ref={heading}
                  tabIndex={-1}
                  id="request-title"
                  className="lp-display"
                >
                  {step === 1 ? "Request a demo" : "What are you building?"}
                </h2>
                <p className="request-muted">
                  {step === 1
                    ? "About 2 minutes. We’ll review your request and email you a booking invitation if there’s a fit."
                    : "Help us understand the opportunity before we meet."}
                </p>
                <div className="demo-form__fields">
                  {step === 1 ? (
                    <>
                      {field("name", "Full name")}
                      {field("email", "Work email", undefined, "email")}
                      {field(
                        "website",
                        "Company website (https://…)",
                        undefined,
                        "url",
                      )}
                      {field("role", "Your role")}
                      {field("size", "Company size", DEMO_OPTIONS.size)}
                    </>
                  ) : (
                    <>
                      {field(
                        "goal",
                        "What would you like Pancake to help you achieve?",
                        DEMO_OPTIONS.goal,
                      )}
                      <fieldset className="service-choice">
                        <legend className="demo-form__label">
                          How would you like to work with us?
                        </legend>
                        <div className="service-cards">
                          {[
                            {
                              name: "Self-serve",
                              price: `${formatDollars(BASE_LEVEL.dollars)}–${formatDollars(TOP_LEVEL.dollars)}/month`,
                              line: "Your team builds and runs your GTM workflows with Pancake.",
                              note: "Choose your monthly credit volume.",
                            },
                            {
                              name: "White Glove",
                              price: `${price}/month`,
                              line: "A dedicated GTM engineer builds and runs your GTM factory with you.",
                              note: `${WHITE_GLOVE_INITIAL_MONTHS}-month initial commitment.`,
                            },
                          ].map((plan) => (
                            <label
                              key={plan.name}
                              className={`service-option${answers.service === plan.name ? " is-selected" : ""}`}
                            >
                              <input
                                type="radio"
                                name="service"
                                required
                                value={plan.name}
                                checked={answers.service === plan.name}
                                onChange={() =>
                                  setAnswers((a) => ({
                                    ...a,
                                    service: plan.name,
                                    budget: "",
                                  }))
                                }
                              />
                              <strong>{plan.name}</strong>
                              <span className="service-price">
                                {plan.price}
                              </span>
                              <span>{plan.line}</span>
                              <small>{plan.note}</small>
                            </label>
                          ))}
                        </div>
                      </fieldset>
                      {answers.service === "White Glove" &&
                        field(
                          "budget",
                          "Is that investment within reach?",
                          DEMO_OPTIONS.whiteGloveBudget,
                        )}
                      {answers.service === "Self-serve" &&
                        field(
                          "budget",
                          "What monthly budget do you have for Pancake?",
                          DEMO_OPTIONS.selfServeBudget,
                        )}
                      {field(
                        "salesTeam",
                        "How many people actively work on outbound sales?",
                        DEMO_OPTIONS.salesTeam,
                      )}
                      {field(
                        "sequencer",
                        "Which outbound tool do you use today?",
                        DEMO_OPTIONS.sequencer,
                      )}
                      {field(
                        "volume",
                        "How many new prospects do you contact per month?",
                        DEMO_OPTIONS.volume,
                      )}
                    </>
                  )}
                </div>
                <p role="alert">{error}</p>
                <div className="request-actions">
                  {step === 2 && (
                    <button
                      type="button"
                      className="preview-link"
                      onClick={() => setStep(1)}
                    >
                      ← Back
                    </button>
                  )}
                  <button
                    disabled={!ready || pending}
                    className="lp-btn lp-btn--primary"
                    type="submit"
                  >
                    {pending
                      ? "Submitting…"
                      : step === 1
                        ? "Continue →"
                        : routesToSelfServe(answers)
                          ? "Explore self-serve →"
                          : "Submit demo request →"}
                  </button>
                </div>
                <p className="request-fine">
                  {step === 1
                    ? "Prefer to get started yourself? "
                    : routesToSelfServe(answers)
                      ? "Watch the demo and get help from Juicy. "
                      : "Submitting a request doesn’t book a meeting. "}
                  {step === 1 ? (
                    <a href="https://app.pancake.ai/signup">Try Pancake</a>
                  ) : (
                    <a href="/privacy">Privacy policy</a>
                  )}
                </p>
              </fieldset>
            </form>
          )}
        </section>
      </section>
      <footer className="request-footer">
        <a href="/privacy">Privacy</a> · <a href="/terms">Terms</a>
      </footer>
    </main>
  );
}
