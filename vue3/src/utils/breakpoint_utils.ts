
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
            return 5
        }
        case "xl": {
            return 6
        }
        case "xxl": {
            return 7
        }
        default: {
            return 1
        }
    }
}