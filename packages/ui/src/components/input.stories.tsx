import type { Meta, StoryObj } from "@storybook/react";
import { Input } from "./input";
import { Label } from "./label";

const meta: Meta<typeof Input> = {
  title: "UI/Input",
  component: Input,
  tags: ["autodocs"],
  argTypes: {
    disabled: { control: "boolean" },
    placeholder: { control: "text" },
    type: { control: "select", options: ["text", "email", "password", "number", "url", "search"] },
  },
};
export default meta;

type Story = StoryObj<typeof Input>;

export const Default: Story = { args: { placeholder: "Enter value…" } };
export const WithLabel: Story = {
  render: () => (
    <div className="grid gap-1.5">
      <Label htmlFor="email">Email address</Label>
      <Input id="email" type="email" placeholder="you@example.com" />
    </div>
  ),
};
export const Disabled: Story = { args: { placeholder: "Disabled input", disabled: true } };
export const Password: Story = { args: { type: "password", placeholder: "••••••••" } };
