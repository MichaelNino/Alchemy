import { ref } from '../reactivity.js';

const state = {
    width: ref(0),
    height: ref(0),
    xs: ref(false),
    sm: ref(false),
    md: ref(false),
    lg: ref(false),
    xl: ref(false),
    gt: {
        xs: ref(false),
        sm: ref(false),
        md: ref(false),
        lg: ref(false)
    },
    lt: {
        sm: ref(false),
        md: ref(false),
        lg: ref(false),
        xl: ref(false)
    },
    name: ref('xs')
};

export const QScreen = {
    get width() { return state.width.value; },
    get height() { return state.height.value; },
    get xs() { return state.xs.value; },
    get sm() { return state.sm.value; },
    get md() { return state.md.value; },
    get lg() { return state.lg.value; },
    get xl() { return state.xl.value; },
    get name() { return state.name.value; },
    gt: {
        get xs() { return state.gt.xs.value; },
        get sm() { return state.gt.sm.value; },
        get md() { return state.gt.md.value; },
        get lg() { return state.gt.lg.value; }
    },
    lt: {
        get sm() { return state.lt.sm.value; },
        get md() { return state.lt.md.value; },
        get lg() { return state.lt.lg.value; },
        get xl() { return state.lt.xl.value; }
    }
};

export function updateScreen(width, height) {
    if (state.width.value === width && state.height.value === height) return;
    
    state.width.value = width;
    state.height.value = height;
    
    const isXs = width < 600;
    const isSm = width >= 600 && width < 1024;
    const isMd = width >= 1024 && width < 1440;
    const isLg = width >= 1440 && width < 1920;
    const isXl = width >= 1920;
    
    state.xs.value = isXs;
    state.sm.value = isSm;
    state.md.value = isMd;
    state.lg.value = isLg;
    state.xl.value = isXl;
    
    if (isXs) state.name.value = 'xs';
    else if (isSm) state.name.value = 'sm';
    else if (isMd) state.name.value = 'md';
    else if (isLg) state.name.value = 'lg';
    else state.name.value = 'xl';
    
    state.gt.xs.value = width >= 600;
    state.gt.sm.value = width >= 1024;
    state.gt.md.value = width >= 1440;
    state.gt.lg.value = width >= 1920;
    
    state.lt.sm.value = width < 600;
    state.lt.md.value = width < 1024;
    state.lt.lg.value = width < 1440;
    state.lt.xl.value = width < 1920;
}
