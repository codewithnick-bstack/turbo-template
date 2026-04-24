import type { Metadata } from "next";
import { TestimonialForm } from "../testimonial-form";

export const metadata: Metadata = { title: "Add Testimonial" };

export default function NewTestimonialPage() {
  return (
    <div className="max-w-xl">
      <h1 className="mb-6 text-2xl font-bold">Add testimonial</h1>
      <TestimonialForm />
    </div>
  );
}
