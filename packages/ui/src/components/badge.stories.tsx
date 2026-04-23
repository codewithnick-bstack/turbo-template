import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "./badge";

const meta: Meta<typeof Badge> = {
  title: "UI/Badge",
  component: Badge,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "secondary", "success", "warning", "destructive", "outline"],
    },
  },
};
export default meta;

type Story = StoryObj<typeof Badge>;

export const Default: Story = { args: { children: "Badge", variant: "default" } };
export const Secondary: Story = { args: { children: "Draft", variant: "secondary" } };
export const Success: Story = { args: { children: "Published", variant: "success" } };
export const Warning: Story = { args: { children: "Pending", variant: "warning" } };
export const Destructive: Story = { args: { children: "Error", variant: "destructive" } };
export const Outline: Story = { args: { children: "Outline", variant: "outline" } };

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="default">Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="success">Success</Badge>
      <Badge variant="warning">Warning</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="outline">Outline</Badge>
    </div>
  ),
};
