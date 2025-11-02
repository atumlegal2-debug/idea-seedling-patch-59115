import heroImage from "@/assets/academy-hero-enhanced.jpg";

const forestBg = "https-lh3-googleusercontent-com-aida-public-AB6AXuA6EcV_cdbKpefluoFtaUxWdGDcF3qctRhvtkRFVntt0_Z3x3OBePH1dQXufIbflj6Xi2FkGhggxRj-UlHzJBAnFKJnivPQWhfhxBVNX_2ubXbiv-8ZumpwdP8MnIsTJj5G-8S2oixtLkwUrHn4AisInAFdo0evjFwUw4gNNvXazPsOi9uGTJF1r2Ft_dJ12_U7q8b-yo1s246OAatYNLh7rvb-0vOYIKihWdZoChogfvfk0qSecwZeFAqAzgzEAoyLdMt0U2oJZgA";
const wooyoungBg = "https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
const romeoBg = "https://images.unsplash.com/photo-1556017998-f9a0da20e9a8?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
const nikiBg = "https://images.unsplash.com/photo-1508873535684-277a3cbcc4e8?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

export const locationThemes = {
  'floresta': {
    bgImage: forestBg,
    overlay: 'bg-black/50',
    header: 'bg-[#102213]/80 border-b-[#92c99b]/20',
    nameColor: 'text-[#92c99b]',
    otherBubble: 'bg-[#234829] text-white',
    inputContainer: 'bg-[#102213]/80 border-t-[#92c99b]/20',
    inputForm: 'bg-[#0A1A0C] border-[#92c99b]/20',
    inputPlaceholder: 'placeholder:text-[#92c99b]/60',
    myBubble: 'bg-[#13ec37] text-[#102213]',
    myNameColor: 'text-[#13ec37]',
  },
  'sala-wooyoung': {
    bgImage: wooyoungBg,
    overlay: 'bg-blue-950/70',
    header: 'bg-blue-950/80 border-b-blue-400/30',
    nameColor: 'text-blue-300',
    otherBubble: 'bg-blue-800/70 text-white',
    inputContainer: 'bg-blue-950/80 border-t-blue-400/30',
    inputForm: 'bg-blue-950/90 border-blue-400/40',
    inputPlaceholder: 'placeholder:text-blue-300/60',
    myBubble: 'bg-sky-400 text-sky-950',
    myNameColor: 'text-sky-300',
  },
  'sala-romeo': {
    bgImage: romeoBg,
    overlay: 'bg-red-950/70',
    header: 'bg-red-950/80 border-b-red-400/30',
    nameColor: 'text-red-300',
    otherBubble: 'bg-red-800/70 text-white',
    inputContainer: 'bg-red-950/80 border-t-red-400/30',
    inputForm: 'bg-red-950/90 border-red-400/40',
    inputPlaceholder: 'placeholder:text-red-300/60',
    myBubble: 'bg-orange-500 text-white',
    myNameColor: 'text-orange-400',
  },
  'sala-niki': {
    bgImage: nikiBg,
    overlay: 'bg-yellow-950/70',
    header: 'bg-yellow-950/80 border-b-yellow-400/30',
    nameColor: 'text-yellow-300',
    otherBubble: 'bg-yellow-800/70 text-white',
    inputContainer: 'bg-yellow-950/80 border-t-yellow-400/30',
    inputForm: 'bg-yellow-950/90 border-yellow-400/40',
    inputPlaceholder: 'placeholder:text-yellow-300/60',
    myBubble: 'bg-amber-400 text-amber-950',
    myNameColor: 'text-amber-300',
  },
  'default': {
    bgImage: heroImage,
    overlay: 'bg-background/90',
    header: 'bg-background/80 border-b-border',
    nameColor: 'text-secondary',
    otherBubble: 'bg-muted text-foreground',
    inputContainer: 'bg-background/80 border-t-border',
    inputForm: 'bg-muted/50 border-border',
    inputPlaceholder: 'placeholder:text-muted-foreground',
    myBubble: 'bg-primary text-primary-foreground',
    myNameColor: 'text-primary-foreground',
  }
};

export const getLocationConfig = (locationId?: string) => {
  if (!locationId) return locationThemes.default;
  return locationThemes[locationId as keyof typeof locationThemes] || locationThemes.default;
};