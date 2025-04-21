import { Card } from '@radix-ui/themes';
import { hostNameMap } from '@/lib/hostNames';
import defaultImage from '@/assets/defaultRecommendation.svg';

interface RecommendationCardProps {
  image?: string;
  type: string;
  date: string;
  name: string;
  podcastName: string;
  podcastNumber: string;
  link?: string;
  platforms?: string;
  genre?: string;
  rate?: number;
  length?: string;
  dima: boolean | null;
  timur: boolean | null;
  maksim: boolean | null;
  guest?: string;
}

interface Host {
  name: string;
  recommended: boolean;
}

const getDomainFromUrl = (url: string): string => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch {
    return url;
  }
}; 

export const RecommendationCard = ({
  image,
  type,
  date,
  name,
  podcastName,
  podcastNumber,
  link,
  platforms,
  genre,
  rate,
  length,
  dima,
  timur,
  maksim,
  guest,
}: RecommendationCardProps) => {
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const hosts: Host[] = [];
  if (dima !== null) hosts.push({ name: 'dima', recommended: dima });
  if (timur !== null) hosts.push({ name: 'timur', recommended: timur });
  if (maksim !== null) hosts.push({ name: 'maksim', recommended: maksim });
  if (guest) hosts.push({ name: guest, recommended: true });

  return (
    <Card className="flex flex-col h-full p-0 overflow-hidden">
      {/* Image section - fixed 1:1 ratio */}
      <div className="w-full aspect-square overflow-hidden">
        <img
          src={image || defaultImage}
          alt={name}
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Content section - takes remaining height */}
      <div className="flex-1 p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-md">
            {type}
          </span>
          <span className="text-sm text-muted-foreground">{formattedDate}</span>
        </div>

        <h3 className="text-xl font-bold m-0">{name}</h3>
        <p className="text-muted-foreground m-0">
          {podcastName} #{podcastNumber}
        </p>

        <div className="mt-2 space-y-2">
          {link && (
            <div className="flex items-center">
              <a 
                href={link} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-primary no-underline hover:underline"
              >
                {getDomainFromUrl(link)}
              </a>
              {rate && (
                <span className="text-base font-medium text-foreground">: {rate}</span>
              )}
            </div>
          )}
          {genre && (
            <div className="text-sm text-muted-foreground">
              {genre}
            </div>
          )}
          {platforms && (
            <div className="text-sm text-muted-foreground">
              {platforms}
            </div>
          )}
          {length && (
            <div className="text-sm text-muted-foreground">
              Length: {length}
            </div>
          )}
        </div>
      </div>

      {/* Footer section - fixed height */}
      <div className="border-t p-4">
        <div className="flex flex-wrap gap-2 text-sm">
          {hosts.map((host) => (
            <span 
              key={host.name} 
              className={`px-2 py-1 rounded-md border flex items-center gap-1 ${
                host.recommended 
                  ? 'border-green-500/20 bg-green-500/10 text-green-500' 
                  : 'border-red-500/20 bg-red-500/10 text-red-500'
              }`}
            >
              {hostNameMap[host.name] || host.name}
              <span className="text-xs">{host.recommended ? '👍' : '❌'}</span>
            </span>
          ))}
        </div>
      </div>
    </Card>
  );
}; 