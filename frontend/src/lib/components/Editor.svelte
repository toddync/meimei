<script>
    import { sveltify } from 'svelte-preprocess-react';
    import Tiptap from '@/components/Tiptap';

  const react = sveltify({ Tiptap }); // Optional step, but adds type-safety
</script>

<react.Tiptap />