import {
    BlockNoteEditor,
    defaultProps,
    insertOrUpdateBlock,
} from "@blocknote/core";
import {
    BlockTypeSelectItem,
    createReactBlockSpec,
} from "@blocknote/react";
import { Menu } from "@mantine/core";
import {
    MdCancel,
    MdCheckCircle,
    MdError,
    MdInfo,
} from "react-icons/md";
import { RiAlertFill } from "react-icons/ri";
import { cn } from "../utils";
import { Separator } from "@/components/ui/separator";

// Alert type configurations
export const alertTypes = [
    {
        title: "Warning",
        value: "warning",
        icon: MdError,
        color: "#e69819",
        backgroundColor: {
            light: "#fff6e6",
            dark: "#805d20",
        },
    },
    {
        title: "Error",
        value: "error",
        icon: MdCancel,
        color: "#d80d0d",
        backgroundColor: {
            light: "#ffe6e6",
            dark: "#802020",
        },
    },
    {
        title: "Info",
        value: "info",
        icon: MdInfo,
        color: "#507aff",
        backgroundColor: {
            light: "#e6ebff",
            dark: "#203380",
        },
    },
    {
        title: "Success",
        value: "success",
        icon: MdCheckCircle,
        color: "#0bc10b",
        backgroundColor: {
            light: "#e6ffe6",
            dark: "#208020",
        },
    },
] as const;

// Alert block definition
export const Block = createReactBlockSpec(
    {
        type: "alert",
        propSchema: {
            textAlignment: defaultProps.textAlignment,
            textColor: defaultProps.textColor,
            type: {
                default: "warning",
                values: ["warning", "error", "info", "success"],
            },
        },
        content: "inline",
    },
    {
        toExternalHTML: (props) => {
            return (
                <div className="alert" data-type={props.block.props.type} data-align={props.block.props.textAlignment}>
                    {/* @ts-ignore */}
                    {props.block.content?.map((i) => i.text).join(" ")}
                </div>
            );
        },

        render: (props) => {
            const alertType = alertTypes.find(
                (a) => a.value === props.block.props.type
            )!;
            const Icon = alertType.icon;
            const type = props.block.props.type
            const align = props.block.props.textAlignment

            return (
                <div className={cn(
                    "flex my-1",
                    align == "left" || align == "justify" && "justify-start",
                    align == "center" && "justify-center",
                    align == "right" && "justify-end",
                )}>
                    <div
                        className={cn(
                            "flex gap-2 rounded-md w-fit font-bold",
                            type == "warning" && "bg-yellow-400/40",
                            type == "error" && "bg-red-400/40",
                            type == "info" && "bg-blue-400/40",
                            type == "success" && "bg-green-400/40"
                        )}
                        data-alert-type={type}
                    >
                        <Menu withinPortal={false}>
                            <Menu.Target>
                                <div className="flex">
                                    <div
                                        className="p-2 flex border-r-2"
                                        contentEditable={false}
                                    >
                                        <Icon
                                            className={cn(
                                                "size-6 my-auto",
                                                type == "warning" && "fill-yellow-400",
                                                type == "error" && "fill-red-400",
                                                type == "info" && "fill-blue-400",
                                                type == "success" && "fill-green-400"
                                            )}
                                            data-alert-icon-type={props.block.props.type}
                                        />
                                    </div>
                                    <Separator orientation="vertical" />
                                </div>
                            </Menu.Target>

                            <Menu.Dropdown>
                                <Menu.Label>Alert Type</Menu.Label>
                                <Menu.Divider />
                                {alertTypes.map((type) => {
                                    const ItemIcon = type.icon;
                                    return (
                                        <Menu.Item
                                            key={type.value}
                                            leftSection={
                                                <ItemIcon
                                                    className="alert-icon"
                                                    data-alert-icon-type={type.value}
                                                />
                                            }
                                            onClick={() =>
                                                props.editor.updateBlock(props.block, {
                                                    type: "alert",
                                                    props: { type: type.value },
                                                })
                                            }
                                        >
                                            {type.title}
                                        </Menu.Item>
                                    );
                                })}
                            </Menu.Dropdown>
                        </Menu>
                        <div className="p-5" ref={props.contentRef} />
                    </div>
                </div>
            );
        },
    }
);

// Insert alert block into editor
export const insert = (editor: BlockNoteEditor) => ({
    title: "Alert",
    subtext: "Alert for emphasizing text",
    onItemClick: () =>
        insertOrUpdateBlock(editor, {
            //@ts-ignore
            type: "alert",
        }),
    aliases: [
        "alert",
        "notification",
        "emphasize",
        "warning",
        "error",
        "info",
        "success",
    ],
    group: "Basic blocks",
    icon: <RiAlertFill />,
});

// Alert block info for the editor
export const info = {
    name: "Alert",
    type: "alert",
    icon: RiAlertFill,
    isSelected: (block) => block.type === "alert",
} satisfies BlockTypeSelectItem;