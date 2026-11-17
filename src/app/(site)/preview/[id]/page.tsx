import { Suspense } from "react";
import { getSpec } from "@/lib/store";
import { PreviewClient } from "./PreviewClient";

export default function PreviewPage({ params }: PageProps<"/preview/[id]">) {
  return (
    <Suspense>
      <Preview params={params} />
    </Suspense>
  );
}

async function Preview({ params }: Pick<PageProps<"/preview/[id]">, "params">) {
  const { id } = await params;
  return <PreviewClient projectId={id} initial={await getSpec(id)} />;
}
