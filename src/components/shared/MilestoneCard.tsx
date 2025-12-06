import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "../ui/button";
import { GripVertical, Trash2, CalendarIcon } from "lucide-react";
import type { UseFieldArrayReturn } from "react-hook-form";
import type { CampaignFormValues } from "@/app/create-campaign/page";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar } from "../ui/calendar";


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
            <FormItem className="flex flex-col">
              <FormLabel>Target Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date < new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}
