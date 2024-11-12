import React, { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Info, Pencil } from "lucide-react";
import { PromptWithLatestVersion } from "@/types/prompts";
import Loader from "@/components/shared/Loader/Loader";
import usePromptVersionsById from "@/api/prompts/usePromptVersionsById";
import UseThisPromptDialog from "@/components/pages/PromptPage/PromptTab/UseThisPromptDialog";
import EditPromptDialog from "@/components/pages/PromptPage/PromptTab/EditPromptDialog";
import CommitHistory from "@/components/pages/PromptPage/PromptTab/CommitHistory";
import usePromptVersionById from "@/api/prompts/usePromptVersionById";
import { StringParam, useQueryParam } from "use-query-params";

interface PromptTabInterface {
  prompt?: PromptWithLatestVersion;
}

const PromptTab = ({ prompt }: PromptTabInterface) => {
  const [openUseThisPrompt, setOpenUseThisPrompt] = useState(false);
  const [openEditPrompt, setOpenEditPrompt] = useState(false);

  const [activeVersionId, setActiveVersionId] = useQueryParam(
    "activeVersionId",
    StringParam,
  );

  const editPromptResetKeyRef = useRef(0);

  const { data } = usePromptVersionsById(
    {
      promptId: prompt?.id || "",
      page: 1,
      size: 25,
    },
    {
      enabled: !!prompt?.id,
      refetchInterval: 30000,
    },
  );

  const { data: activeVersion } = usePromptVersionById(
    {
      versionId: activeVersionId || "",
    },
    {
      enabled: !!activeVersionId,
    },
  );

  const versions = data?.content;

  const handleOpenEditPrompt = (value: boolean) => {
    editPromptResetKeyRef.current = editPromptResetKeyRef.current + 1;
    setOpenEditPrompt(value);
  };

  useEffect(() => {
    if (prompt?.latest_version?.id && !activeVersionId) {
      setActiveVersionId(prompt.latest_version.id, "replaceIn");
    }
  }, [prompt?.latest_version?.id, activeVersionId, setActiveVersionId]);

  useEffect(() => {
    return () => {
      setActiveVersionId(null);
    };
  }, [setActiveVersionId]);

  if (!prompt) {
    return <Loader />;
  }

  return (
    <>
      <div>
        <div className="flex w-full items-center">
          <Button variant="outline" onClick={() => setOpenUseThisPrompt(true)}>
            <Info className="mr-2 size-4" />
            Use this prompt
          </Button>

          <Button
            className="ml-auto"
            variant="secondary"
            onClick={() => handleOpenEditPrompt(true)}
          >
            <Pencil className="mr-2 size-4" />
            Edit prompt
          </Button>
        </div>

        <div className="mt-6 flex gap-2 rounded-md border bg-white p-6">
          <div className="flex grow flex-col">
            <p className="comet-body-s-accented text-foreground">Prompt</p>
            <code className="comet-code mt-2 flex w-full whitespace-pre-wrap break-all rounded-md bg-primary-foreground p-3">
              {activeVersion?.template}
            </code>
          </div>
          <div className="min-w-[320px]">
            <p className="comet-body-s-accented mb-2 text-foreground">
              Commit history
            </p>

            <CommitHistory
              versions={versions || []}
              activeVersionId={activeVersionId || ""}
              onVersionClick={(version) => setActiveVersionId(version.id)}
            />
          </div>
        </div>
      </div>

      <UseThisPromptDialog
        open={openUseThisPrompt}
        setOpen={setOpenUseThisPrompt}
        promptName={prompt.name}
      />

      <EditPromptDialog
        key={editPromptResetKeyRef.current}
        open={openEditPrompt}
        setOpen={handleOpenEditPrompt}
        promptName={prompt.name}
        promptTemplate={activeVersion?.template || ""}
        onSetActiveVersionId={setActiveVersionId}
      />
    </>
  );
};

export default PromptTab;
