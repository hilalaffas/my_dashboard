import { ArrowUpRight } from 'lucide-react'
export function MetricCard({ icon: Icon, label, value, change, tone = 'green' }) {
  return (
    <article className="metric-card">
      <div className="metric-top">
        <span>{label}</span>
        <span className="icon-bubble">
          <Icon size={17} />
        </span>
      </div>
      <strong>{value}</strong>
      <span className={`change ${tone}`}>
        <ArrowUpRight size={13} /> {change} <em>vs last month</em>
      </span>
    </article>
  )
}
