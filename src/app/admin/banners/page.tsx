import Image from "next/image";
import { bannerRows } from "@/data/admin";

export default function AdminBannersPage() {
  return (
    <main className="adminMain">
      <section className="adminPanel">
        <div className="adminPanelHeader">
          <div>
            <p>Home</p>
            <h2>Banners do carrossel</h2>
          </div>
          <button className="adminButton" type="button">
            Novo banner
          </button>
        </div>

        <div className="bannerTable">
          {bannerRows.map((banner) => (
            <article className="bannerRow" key={banner.image}>
              <div className="bannerThumb">
                <Image src={banner.image} fill alt="" sizes="120px" />
              </div>
              <div>
                <h3>{banner.title}</h3>
                <p>Ordem {banner.order} - {banner.status}</p>
              </div>
              <div className="bannerActions">
                <button type="button">Editar</button>
                <button type="button">Mover</button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="adminPanel adminFormPanel">
        <div className="adminPanelHeader">
          <div>
            <p>Formulario</p>
            <h2>Campos planejados</h2>
          </div>
        </div>
        <form className="adminForm">
          <label>
            Titulo
            <input placeholder="Ex: CONAD 2026" type="text" />
          </label>
          <label>
            Texto
            <textarea placeholder="Chamada do banner" rows={4} />
          </label>
          <label>
            Imagem desktop
            <input type="file" />
          </label>
          <label>
            Imagem mobile
            <input type="file" />
          </label>
        </form>
      </section>
    </main>
  );
}
