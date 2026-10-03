export const collapsibleItemClass =
  "group overflow-hidden rounded-xl border border-border/70 bg-card/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-[border-color,box-shadow] last:border-b hover:border-gold/25 has-[[data-state=open]]:border-gold/35 has-[[data-state=open]]:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_0_0_1px_rgba(212,175,55,0.08)]";

export const collapsibleTriggerClass =
  "flex w-full items-center gap-3 rounded-none px-3.5 py-3.5 hover:no-underline focus-visible:border-transparent data-[state=open]:border-b data-[state=open]:border-border/60 sm:gap-4 sm:px-4 sm:py-4 [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-muted-foreground/70 [&>svg]:transition-colors group-has-[[data-state=open]]:[&>svg]:text-gold";

export const collapsibleContentClass = "overflow-x-hidden px-3.5 pb-4 pt-3 sm:px-4";

export const collapsiblePanelClass =
  "flex flex-col overflow-hidden rounded-xl border border-border/60 bg-muted/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]";

export const collapsibleThumbnailClass =
  "relative w-[5.625rem] h-[4.5rem] shrink-0 overflow-hidden rounded-xl border border-white/10 ring-1 ring-white/5 sm:w-[6.5625rem] sm:h-[5.25rem]";
