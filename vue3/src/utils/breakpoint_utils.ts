
export function homePageCols(breakpoint: string){
    switch (breakpoint) {
        case "xs": {
            return 1
        }
        case "sm": {
            return 2
        }
         case "md": {
            return 4
        }
        case "lg": {
            return 4
        }
        case "xl": {
            return 5
        }
        case "xxl": {
            return 6
        }
        default: {
            return 1
        }
    }
}