import * as React from "react"
import {
  Accordion as RadixAccordion,
  AccordionItem as RadixAccordionItem,
  AccordionTrigger as RadixAccordionTrigger,
  AccordionContent as RadixAccordionContent,
} from "@radix-ui/react-accordion"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"

const Accordion = RadixAccordion

const AccordionItem = React.forwardRef<any, any>(({ className, ...props }, ref) => (
  <RadixAccordionItem
    ref={ref}
    className={cn("", className)}
    {...props}
  />
))
AccordionItem.displayName = "AccordionItem"

const AccordionTrigger = React.forwardRef<any, any>(({ className, children, ...props }, ref) => (
  <div className="flex">
    <RadixAccordionTrigger
      ref={ref}
      className={cn(
        "flex flex-1 items-center justify-between text-sm font-medium transition-all [&[data-state=open]>svg]:rotate-180",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
    </RadixAccordionTrigger>
  </div>
))
AccordionTrigger.displayName = "AccordionTrigger"

const AccordionContent = React.forwardRef<any, any>(({ className, children, ...props }, ref) => (
  <RadixAccordionContent
    ref={ref}
    className="overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    {...props}
  >
    <div className={cn("pb-4 pt-0", className)}>{children}</div>
  </RadixAccordionContent>
))

AccordionContent.displayName = "AccordionContent"

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
