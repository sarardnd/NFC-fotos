type EmptyStateProps = {
  emoji?: string;
  title: string;
  description?: string;
};

export function EmptyState({ emoji = "📭", title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <span className="text-4xl">{emoji}</span>
      <p className="text-base font-medium text-foreground">{title}</p>
      {description && (
        <p className="max-w-xs text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
