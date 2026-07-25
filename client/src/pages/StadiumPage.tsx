import { useParams } from "react-router-dom";

export default function StadiumPage() {
  const { slug } = useParams<{ slug: string }>();

  return (
    <section>
      <h1 className="text-3xl font-bold tracking-tight text-white">{slug}</h1>
    </section>
  );
}
