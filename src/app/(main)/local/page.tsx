import { readContent } from "@/lib/content";
import MapBox3D from "./MapBox3D";

export const dynamic = "force-dynamic";

type Local = { nome: string; endereco: string; cidade: string; estado: string; cep: string; descricao: string; lat: string; lng: string; como_chegar: string; hospedagem: string };

const VENUE_LAT = 28.848;
const VENUE_LNG = -81.877;

export default async function LocalPage() {
  const d = await readContent<Local>("local");
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? process.env.MAPBOX_TOKEN ?? "";

  const lat = d.lat ? parseFloat(d.lat) : VENUE_LAT;
  const lng = d.lng ? parseFloat(d.lng) : VENUE_LNG;

  return (
    <main>
      <div className="localMapWrap">
        <MapBox3D lat={lat} lng={lng} token={token} />
      </div>

      <section className="section localContent">
        <p className="localVenueAddress">39034 County Rd 452, Leesburg, FL 34788</p>
        <p className="localDescricao">Serão momentos que ficarão guardados para sempre em nossos corações, com experiências que certamente marcarão vidas, famílias e ministérios. Temos a convicção de que o nosso amado Senhor Jesus fará maravilhas em nosso meio, renovando forças, restaurando corações e manifestando Sua presença de maneira poderosa.</p>
      </section>
    </main>
  );
}
