import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { serverFetch } from "@/lib/api";
import type { Testimonial } from "@/lib/types";
import { TestimonialForm } from "../testimonial-form";

export const metadata: Metadata = { title: "Edit Testimonial" };

export default async function EditTestimonialPage({ params }: { params: Promise<{ testimonialId: string }> }) {
  const { testimonialId } = await params;

  let testimonial: Testimonial;
  try {
    testimonial = await serverFetch<Testimonial>(`/testimonials/${testimonialId}`);
  } catch {
    notFound();
  }

  return (
    <div className="max-w-xl">
      <h1 className="mb-6 text-2xl font-bold">Edit testimonial</h1>
      <TestimonialForm testimonial={testimonial} />
    </div>
  );
}
