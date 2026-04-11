"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Send } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const contactSchema = z.object({
  name: z.string().min(2, "Please enter your name."),
  email: z.string().email("Enter a valid email."),
  company: z.string().optional(),
  message: z.string().min(20, "Tell us a little more about the project."),
});

type ContactValues = z.infer<typeof contactSchema>;

const defaultValues: ContactValues = {
  name: "",
  email: "",
  company: "",
  message: "",
};

export function ContactForm() {
  const [status, setStatus] = useState<string | null>(null);
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

    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
    const response = await fetch(`${apiBaseUrl}/api/contact`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      setStatus(payload?.error ?? "Something went wrong. Please try again.");
      return;
    }

    reset(defaultValues);
    setStatus("Thanks — your message is on the way.");
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="mb-2 block text-sm font-medium">Name</label>
          <Input id="name" aria-invalid={!!errors.name} {...register("name")} />
          {errors.name ? <p className="mt-1 text-xs text-rose-500">{errors.name.message}</p> : null}
        </div>
        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-medium">Email</label>
          <Input id="email" type="email" aria-invalid={!!errors.email} {...register("email")} />
          {errors.email ? <p className="mt-1 text-xs text-rose-500">{errors.email.message}</p> : null}
        </div>
      </div>
      <div>
        <label htmlFor="company" className="mb-2 block text-sm font-medium">Company</label>
        <Input id="company" {...register("company")} />
      </div>
      <div>
        <label htmlFor="message" className="mb-2 block text-sm font-medium">Project details</label>
        <Textarea id="message" aria-invalid={!!errors.message} {...register("message")} />
        {errors.message ? <p className="mt-1 text-xs text-rose-500">{errors.message.message}</p> : null}
      </div>
      <Button type="submit" className="w-full sm:w-auto" disabled={isSubmitting}>
        {isSubmitting ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Send className="mr-2 size-4" />}
        Send inquiry
      </Button>
      {status ? <p className="text-sm text-slate-600 dark:text-slate-300">{status}</p> : null}
    </form>
  );
}
