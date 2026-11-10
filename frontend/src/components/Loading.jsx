export default function Loading({ label = 'Loading data…' }) {
  return <div className="loading"><span className="spinner"/>{label}</div>
}
