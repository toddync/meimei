import { Tab, useTabStore } from "../stores/tabs";
import { EditorPage } from "./editor";
import ImagePage from "./image-page";

export default function TabBody({ tab }: { tab: Tab }) {
    let file = useTabStore(s => s.getData(tab.value))

    return (<>
        <div className="h-[calc(100%-44px)] flex flex-1 overflow-hidden">
            {tab.type == "editor" && <EditorPage file={file} tab={tab} />}
            {tab.type == "image" && <ImagePage file={file} />}
        </div>
    </>
    )
}