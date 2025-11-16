import { ref, computed, onMounted, onBeforeUnmount } from 'vue';

export interface VirtualizationOptions {
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
  buffer?: number;
}

export function useVirtualization<T>(
  items: T[],
  options: VirtualizationOptions
) {
  const {
    itemHeight,
    containerHeight,
    overscan = 3,
    buffer = 5,
  } = options;

  const scrollTop = ref(0);
  const containerRef = ref<HTMLElement | null>(null);

  const totalHeight = computed(() => items.length * itemHeight);

  const startIndex = computed(() => {
    const index = Math.floor(scrollTop.value / itemHeight);
    return Math.max(0, index - overscan);
  });

  const endIndex = computed(() => {
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const index = startIndex.value + visibleCount + overscan + buffer;
    return Math.min(items.length, index);
  });

  const visibleItems = computed(() => {
    return items.slice(startIndex.value, endIndex.value);
  });

  const offsetY = computed(() => {
    return startIndex.value * itemHeight;
  });

  const handleScroll = (event: Event) => {
    const target = event.target as HTMLElement;
    scrollTop.value = target.scrollTop;
  };

  const scrollToIndex = (index: number) => {
    if (!containerRef.value) return;
    const targetScroll = index * itemHeight;
    containerRef.value.scrollTop = targetScroll;
    scrollTop.value = targetScroll;
  };

  const scrollToTop = () => {
    scrollToIndex(0);
  };

  const scrollToBottom = () => {
    scrollToIndex(items.length - 1);
  };

  return {
    containerRef,
    scrollTop,
    startIndex,
    endIndex,
    visibleItems,
    offsetY,
    totalHeight,
    handleScroll,
    scrollToIndex,
    scrollToTop,
    scrollToBottom,
  };
}





