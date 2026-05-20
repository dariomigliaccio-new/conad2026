import { editableContent } from "@/data/admin";

export default function AdminContentPage() {
  return (
    <main className="adminMain">
      <section className="adminPanel">
        <div className="adminPanelHeader">
          <div>
            <p>CMS</p>
            <h2>Conteudo publico</h2>
          </div>
          <button className="adminButton" type="button">
            Salvar alteracoes
          </button>
        </div>

        <form className="contentEditor">
          {editableContent.map((field) => (
            <label key={field.key}>
              <span>{field.label}</span>
              <small>{field.key}</small>
              <input defaultValue={field.value} type="text" />
            </label>
          ))}
        </form>
      </section>
    </main>
  );
}
