import { Mail, Slack, Github, FileText, Box } from 'lucide-react';

const iconMap = {
  Mail,
  Slack,
  Github,
  FileText,
};

export function ServiceIcon({ iconName, size = 24, color = 'currentColor', className = '' }) {
  const Icon = iconMap[iconName] || Box;
  return <Icon size={size} color={color} className={className} />;
}

