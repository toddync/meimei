import TabPanel from "@mui/lab/TabPanel";
import { Tab } from "../stores/tab-store";
import { EditorPage } from "./editor";

export default function TabBody({ tab }: { tab: Tab }) {
    return (
        <TabPanel value={tab.value} sx={{
            overflow: "hidden"
        }} className="TabBody">
            {tab.type == "editor" && <EditorPage file={tab.data} />}
        </TabPanel>
    )
}