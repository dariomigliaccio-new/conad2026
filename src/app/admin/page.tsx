import Link from "next/link";
import { adminMetrics, adminModules } from "@/data/admin";

export default function AdminDashboardPage() {
  return (
    <main className="adminMain">
      <section className="adminMetricGrid" aria-label="Resumo">
        {adminMetrics.map((metric) => (
          <article className="adminMetric" key={metric.label}>
            <p>{metric.label}</p>
            <strong>{metric.value}</strong>
          </article>
        ))}
      </section>

      <section className="adminPanel">
        <div className="adminPanelHeader">
          <div>
            <p>Modulos</p>
            <h2>Primeira estrutura do novo sistema</h2>
          </div>
          <span>Mock pronto para banco</span>
        </div>
        <div className="adminModuleGrid">
          {adminModules.map((module) => (
            <Link className="adminModule" href={module.href} key={module.title}>
              <h3>{module.title}</h3>
              <p>{module.text}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
