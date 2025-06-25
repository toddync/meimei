import { Tab, useTabStore } from "../stores/tabs";
import { EditorPage } from "./editor";

export default function TabBody({ tab }: { tab: Tab }) {
    let file = useTabStore(s => s.getData(tab.value))
    return (<>
        {file &&
            <div className="TabBody">
                {tab.type == "editor" && <EditorPage file={file} tab={tab} />}
            </div>
        }
    </>
    )
}