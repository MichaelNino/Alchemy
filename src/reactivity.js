let currentEffect = null;

export function effect(fn) {
    const effectFn = () => {
        const prevEffect = currentEffect;
        currentEffect = effectFn;
        try {
            return fn();
        } finally {
            currentEffect = prevEffect;
        }
    };
    effectFn();
    return effectFn;
}

export function ref(initialValue) {
    let value = initialValue;
    const deps = new Set();
    
    return {
        get value() {
            if (currentEffect) {
                deps.add(currentEffect);
            }
            return value;
        },
        set value(newValue) {
            if (value !== newValue) {
                value = newValue;
                // Trigger effects
                const effects = new Set(deps);
                for (const effectFn of effects) {
                    effectFn();
                }
            }
        }
    };
}

export function computed(getter) {
    const result = ref();
    let isInitialized = false;
    
    effect(() => {
        result.value = getter();
        isInitialized = true;
    });
    
    return {
        get value() {
            if (!isInitialized) {
                result.value = getter();
                isInitialized = true;
            }
            return result.value;
        }
    };
}
