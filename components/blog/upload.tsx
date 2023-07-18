"use client";
import { FormEvent, useState } from "react";
import { useSnackbar } from "notistack";

export default function UploadFileButton(props: {
    getFileList: Function;
    currentDir: string;
}) {
    const { getFileList, currentDir } = props;
    const [files, setFiles] = useState<FileList | null>();
    const { enqueueSnackbar } = useSnackbar();

    function handleFiles(
        e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
    ) {
        const files = (e.target as HTMLInputElement).files;
        setFiles(files);
    }

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!files) {
            return;
        }
        if (files.length === 0) {
            return;
        }
        for (const index in files) {
            const file = files[index];
            if (!(file instanceof File)) {
                continue;
            }
            const fileName = file.name;
            // Get signed key for file name in current directory.
            const response = await fetch(
                `/api/presignedurl?fileName=${currentDir.slice(1)}${fileName}`
            );
            const data = await response.json();
            const url = data.data.url;

            fetch(url, {
                method: "PUT",
                body: file,
            })
                .then((response) => {
                    if (!response.ok) {
                        return enqueueSnackbar(
                            `Error uploading ${fileName} to ${currentDir}.`,
                            {
                                variant: "error",
                            }
                        );
                    }
                    enqueueSnackbar(
                        `${fileName} successfully uploaded to ${currentDir}.`,
                        {
                            variant: "success",
                        }
                    );
                    getFileList();
                })
                .catch((err) => {
                    enqueueSnackbar(`Error uploading ${fileName} to ${currentDir}.`, {
                        variant: "error",
                    });
                });
        }
    }

    return (
        <>
            <form method="POST" onSubmit={handleSubmit} encType="multipart/form-data">
                <input
                    onChange={handleFiles}
                    type="file"
                    multiple={true}
                />
                <button
                    type="submit"
                >
                    Submit
                </button>
            </form>
        </>
    );
}