"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Send } from "lucide-react";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { submitContact } from "@/lib/api";
import { ANALYTICS_EVENTS, trackEvent } from "@/lib/analytics";

const contactSchema = z.object({
  name: z.string().min(2, "Please enter your name."),
  email: z.string().email("Enter a valid email."),
  phone: z.string().optional(),
  subject: z.string().optional(),
  message: z.string().min(20, "Tell us a little more about the project."),
  _trap: z.string().max(0).optional(),
});

type ContactValues = z.infer<typeof contactSchema>;

const defaultValues: ContactValues = {
  name: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
  _trap: "",
};

export function ContactForm() {
  const [status, setStatus] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const startedRef = useRef(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues,
  });

  const onSubmit = async (values: ContactValues) => {
    setStatus(null);
    if (values._trap) {
      setIsSuccess(true);
      setStatus("Thanks — your message is on the way.");
      return;
    }
    const { _trap: _, ...payload } = values;
    try {
      await submitContact(payload);
      reset(defaultValues);
      setIsSuccess(true);
      setStatus("Thanks — your message is on the way.");
      trackEvent(ANALYTICS_EVENTS.CONTACT_FORM_SUBMITTED, { form_name: "contact" });
    } catch (err) {
      setIsSuccess(false);
      setStatus(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  };

  return (
    <form
      className="space-y-4"
      onSubmit={handleSubmit(onSubmit)}
      onFocus={() => {
        if (startedRef.current) return;
        startedRef.current = true;
        trackEvent(ANALYTICS_EVENTS.CONTACT_FORM_STARTED, { form_name: "contact" });
      }}
      noValidate
      aria-label="Contact form"
    >
      {/* Honeypot — hidden from real users, bots fill it in */}
      <div className="absolute -left-[9999px] -top-[9999px] overflow-hidden" aria-hidden="true">
        <label htmlFor="_trap">Leave this empty</label>
        <input id="_trap" type="text" tabIndex={-1} autoComplete="off" {...register("_trap")} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="mb-2 block text-sm font-medium">Name</label>
          <Input
            id="name"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "name-error" : undefined}
            {...register("name")}
          />
          {errors.name ? (
            <p id="name-error" role="alert" className="mt-1 text-xs text-rose-500">{errors.name.message}</p>
          ) : null}
        </div>
        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-medium">Email</label>
          <Input
            id="email"
            type="email"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
            {...register("email")}
          />
          {errors.email ? (
            <p id="email-error" role="alert" className="mt-1 text-xs text-rose-500">{errors.email.message}</p>
          ) : null}
        </div>
      </div>
      <div>
        <label htmlFor="subject" className="mb-2 block text-sm font-medium">Subject</label>
        <Input id="subject" {...register("subject")} />
      </div>
      <div>
        <label htmlFor="message" className="mb-2 block text-sm font-medium">Project details</label>
        <Textarea
          id="message"
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? "message-error" : undefined}
          {...register("message")}
        />
        {errors.message ? (
          <p id="message-error" role="alert" className="mt-1 text-xs text-rose-500">{errors.message.message}</p>
        ) : null}
      </div>
      <Button type="submit" className="w-full sm:w-auto" disabled={isSubmitting}>
        {isSubmitting ? <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" /> : <Send className="mr-2 size-4" aria-hidden="true" />}
        Send inquiry
      </Button>
      {status ? (
        <p
          role={isSuccess ? "status" : "alert"}
          className={`text-sm ${isSuccess ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}
        >
          {status}
        </p>
      ) : null}
    </form>
  );
}
