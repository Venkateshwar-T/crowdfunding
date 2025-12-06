import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "../ui/button";
import { GripVertical, Trash2 } from "lucide-react";
import type { UseFieldArrayReturn } from "react-hook-form";
import type { CampaignFormValues } from "@/app/create-campaign/page";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";


type MilestoneCardProps = {
  index: number;
  remove: UseFieldArrayReturn<CampaignFormValues, "milestones">['remove'];
}

export function MilestoneCard({ index, remove }: MilestoneCardProps) {
  return (
    <Card className="relative p-4 pl-10 border-dashed">
       <Button type="button" variant="ghost" size="icon" className="absolute left-1 top-1/2 -translate-y-1/2 cursor-grab">
           <GripVertical className="h-5 w-5 text-muted-foreground" />
       </Button>
      <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1" onClick={() => remove(index)}>
        <Trash2 className="h-5 w-5 text-destructive" />
      </Button>
      <CardContent className="p-0 space-y-4">
        <FormField
          name={`milestones.${index}.title`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder={`Milestone ${index + 1}`} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name={`milestones.${index}.description`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="What will be achieved?" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name={`milestones.${index}.targetDate`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Target Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}
