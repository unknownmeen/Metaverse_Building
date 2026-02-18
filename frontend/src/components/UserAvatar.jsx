import { User } from 'lucide-react';
import { cn } from '../lib/utils';

export default function UserAvatar({
  src,
  alt = '',
  className = '',
  iconClassName = '',
}) {
  if (src) {
    return <img src={src} alt={alt} className={cn('rounded-full object-cover', className)} />;
  }

  return (
    <span
      className={cn(
        'rounded-full bg-slate-200 text-slate-500 inline-flex items-center justify-center',
        className
      )}
      aria-hidden="true"
    >
      <User className={cn('w-3/5 h-3/5', iconClassName)} />
    </span>
  );
}
