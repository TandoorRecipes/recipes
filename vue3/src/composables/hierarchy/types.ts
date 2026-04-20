import type {EditorSupportedTypes} from "@/types/Models"

export interface FlatTreeNode {
    id: number
    name: string
    parent: number | null
    numchild: number
    depth: number
    hasChildren: boolean
    data: EditorSupportedTypes
    isLoadMore?: boolean
    loadMoreParentId?: number | null
}

export interface BreadcrumbItem {
    id: number | null
    name: string
}

export interface HierarchyCacheEntry {
    items: EditorSupportedTypes[]
    hasMore: boolean
    page: number
}
