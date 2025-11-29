import type { Style, ClipType } from "../types";

const STYLE_GUIDES: Record<Style, string> = {
  watercolor: `# Watercolor Style Guide

## Visual Characteristics
- Soft, flowing edges with gentle color bleeds
- Translucent layered washes
- Visible paper texture showing through
- Organic, imperfect brushstrokes
- Colors blend naturally at boundaries
- Wet-on-wet technique appearance
- Granulation effects in pigments

## Color Palette
- Muted, harmonious tones
- Soft pastels with occasional vibrant accents
- White space as breathing room
- Deep indigos or browns instead of harsh blacks
- Primary: soft blues, sage greens, dusty rose
- Secondary: warm ochres, lavender, seafoam
- Highlights: paper white showing through
- Shadows: layered washes, never solid

## Typography
- Handwritten or script fonts preferred
- Text appears painted, not digital
- Soft edges on all lettering
- Muted colors for text (deep indigo, brown)
- Titles: elegant, flowing scripts
- Labels: simple, readable brush lettering
- Avoid bold, heavy typefaces
- Text should feel like part of the painting

## Character Guidelines
- Soft, dreamy facial features
- Hair rendered with flowing brushstrokes
- Clothing with visible color washes and texture
- Gentle expressions, avoid harsh details
- Consistent silhouette across clips
- Skin tones: warm peach washes with rosy accents
- Eyes: simple but expressive, soft edges
- Maintain same color palette for recurring characters

## Background & Environment
- Loose, impressionistic backgrounds
- Environmental details fade at edges
- Atmospheric perspective through wash intensity
- Nature scenes with organic shapes
- Indoor scenes: warm, cozy lighting
- Sky: gradient washes with soft clouds
- Water: reflective with color bleeds

## Mood & Atmosphere
- Dreamy, contemplative, peaceful
- Nostalgic and romantic
- Gentle emotional warmth
- Meditative, calming energy
- Soft natural lighting throughout
- Golden hour or overcast quality
- Intimate, personal feeling

## Lighting
- Soft, diffused light sources
- No harsh shadows or highlights
- Light appears to glow through washes
- Warm golden tones for sunlight
- Cool blue tones for shade
- Backlit subjects with glowing edges

## Narration Style
- Gentle, soothing voice tone
- Poetic, lyrical language choices
- Flowing sentences, unhurried pace
- Evocative descriptions over technical terms
- Reflective, contemplative delivery
- Use metaphors and imagery
- Calm, measured pacing

## Composition Rules
- Asymmetrical balance preferred
- Negative space is essential
- Subjects emerge from washes rather than sharp outlines
- Focal points through color saturation, not edges
- Rule of thirds with organic placement
- Layered depth through wash intensity

## Image Prompt Additions
Always include: "watercolor painting style, soft washes, visible brushstrokes, paper texture, flowing edges, translucent layers, dreamy atmosphere, gentle lighting"

## Avoid
- Hard edges or sharp lines
- Solid flat colors
- Digital/vector appearance
- Over-saturated neon colors
- Perfect geometric shapes
- Overly detailed facial features
- Photorealistic character rendering
- Bold, heavy typography
- Harsh lighting or deep shadows`,

  anime: `# Anime Style Guide

## Visual Characteristics
- Bold, clean outlines (consistent line weight)
- Flat color fills with cel-shading
- Expressive characters with large eyes - ALWAYS include characters
- Dynamic poses and compositions
- Speed lines for motion
- Screen tones for shading
- Sharp, precise linework
- Characters are the focal point of every scene

## Color Palette
- Vibrant, saturated colors
- High contrast between light and shadow
- Limited color gradients (cel-shaded)
- Bold color choices for emphasis
- Primary: bright blues, reds, yellows
- Hair colors: any vibrant shade (pink, blue, etc.)
- Skin: warm peachy tones with pink blush
- Shadows: single tone, hard-edged

## Typography
- CRITICAL: NEVER include meta-labels like "CLIP", "INTRO", "OUTRO", "CHAPTER", "SECTION" - these are forbidden
- First clip (intro): Include a stylish, eye-catching title text that hooks the viewer
- Other clips: Text is optional but can include short impactful phrases or keywords
- All text in images must be in simple English only, regardless of the selected language
- Bold, dynamic anime-style fonts with high contrast
- Outlined text for readability against backgrounds
- Sound effects as visual elements (e.g., "BOOM!", "WHOOSH!")
- Clean, modern lettering - no handwriting or script fonts

## Character Guidelines (MANDATORY - every image must have characters)
- ALWAYS include at least one character in every scene
- Large expressive eyes with highlights (catch lights)
- Simplified nose and mouth
- Distinctive hair with bold color and spiky/flowing shapes
- Consistent character proportions (head-to-body ratio)
- Signature outfit or accessory for recognition
- Exaggerated expressions for emotion
- Skin: smooth, flat-shaded with warm undertones
- Hair color must stay consistent across all clips
- Maintain same eye color and shape throughout
- Dynamic hair movement suggesting action
- Characters should be prominent, not small or background elements

## Background & Environment
- Detailed backgrounds when needed
- Simple or abstract for character focus
- Dramatic sky with clouds
- Urban: neon lights, detailed architecture
- Nature: stylized trees, dramatic landscapes
- Indoor: clean lines, perspective correct
- Background blur for depth (bokeh effect)

## Mood & Atmosphere
- Energetic and dynamic
- Emotionally expressive
- Dramatic tension when needed
- Hopeful and inspiring
- Can shift rapidly between moods
- Epic, larger-than-life feeling
- Youthful energy

## Lighting
- Dramatic, high-contrast lighting
- Rim lighting for character emphasis
- Colored lighting for mood (blue=sad, orange=warm)
- Lens flares and light rays
- Strong directional light sources
- Backlight for silhouette moments
- Cel-shaded shadow shapes

## Narration Style
- Energetic, enthusiastic delivery
- Direct, punchy sentences
- Exclamation for emphasis
- Building tension and release
- Conversational but dramatic
- Can use rhetorical questions
- Fast-paced for action, slower for emotion
- Clear, confident voice

## Composition Rules
- Dynamic angles and perspectives
- Rule of thirds with dramatic focal points
- Motion implied through composition
- Background detail varies with narrative focus
- Dutch angles for tension
- Extreme close-ups for emotion
- Wide shots for scale

## Image Prompt Additions
Always include: "anime style, cel-shaded, bold outlines, vibrant colors, clean linework, featuring prominent anime character with expressive eyes, dynamic composition, modern animation aesthetic, character-focused scene"

## Avoid
- ANY meta-text like "CLIP", "INTRO", "OUTRO", "CHAPTER", "SECTION", "TITLE" - NEVER include these
- Section titles, headers, or labels in images
- Text-heavy images - keep text minimal or none
- Realistic proportions
- Soft, blended edges
- Photorealistic textures
- Muted or desaturated palettes
- Western cartoon style
- Inconsistent eye size between clips
- Changing character hair color
- Sketchy or rough linework
- Gradient shading
- Japanese text or kanji
- Japanese cultural symbols
- Any non-English text
- Empty scenes without characters
- Landscapes or backgrounds without people
- Abstract or object-only compositions`,

  retro: `# Retro Style Guide

## Visual Characteristics
- Vintage 1950s-1970s aesthetic
- Halftone dots and print textures
- Limited color palette (screen printing)
- Geometric shapes and bold typography
- Grain and aging effects
- Visible print registration marks
- Offset printing imperfections

## Color Palette
- Warm oranges, teals, mustard yellows
- Faded, slightly desaturated tones
- Two to four color combinations maximum
- Cream/off-white backgrounds
- Primary: burnt orange, teal, mustard
- Secondary: olive green, burgundy, brown
- Accent: coral pink, powder blue
- Black used sparingly, often as dark brown

## Typography
- Bold, chunky sans-serif fonts
- Slab serifs for headlines
- Groovy, psychedelic lettering for accents
- Hand-lettered appearance
- All caps for impact
- Stacked text compositions
- Decorative borders and frames
- Vintage ad typography styles
- Script fonts: 50s diner style
- Distressed, printed texture on text

## Character Guidelines
- Stylized, geometric facial features
- Bold silhouette shapes
- Period-appropriate hairstyles (bouffant, mod cuts)
- Limited color fills, no gradients on skin
- Strong graphic outlines
- Characters as poster-style illustrations
- Consistent costume color within the limited palette
- Simple dot eyes or geometric eye shapes
- Maintain same silhouette proportions across clips
- 60s fashion: mod dresses, slim suits

## Background & Environment
- Flat, graphic backgrounds
- Geometric patterns (starbursts, circles)
- Simplified architectural elements
- Period-appropriate interiors
- Atomic age design motifs
- Suburban or urban 60s settings
- Abstract color blocks

## Mood & Atmosphere
- Optimistic, aspirational
- Nostalgic warmth
- Mid-century modern sophistication
- Space age wonder
- Playful yet refined
- Confident, forward-looking
- Slightly campy, self-aware

## Lighting
- Flat, even lighting (print aesthetic)
- No complex shadows
- Silhouette style for drama
- Spotlight effects for emphasis
- Minimal depth from lighting
- High-key, bright overall

## Narration Style
- Confident, announcer-style delivery
- Upbeat, optimistic tone
- Period-appropriate vocabulary
- Short, punchy sentences
- Exclamatory enthusiasm
- Can be slightly campy
- Clear enunciation
- "Gee whiz" wonder for science topics

## Composition Rules
- Strong graphic design principles
- Bold silhouettes and shapes
- Text integrated as visual element
- Symmetry and balance emphasized
- Poster-style layouts
- Clear visual hierarchy
- Borders and frames as design elements

## Image Prompt Additions
Always include: "retro vintage style, 1960s aesthetic, halftone texture, limited color palette, screen print look, mid-century modern design, poster art style, grain texture"

## Avoid
- Modern gradients
- Photorealistic rendering
- More than 4-5 colors
- Clean digital appearance
- Contemporary design elements
- Detailed facial features
- Modern hairstyles or clothing
- Smooth, perfect textures
- Complex lighting effects`,

  whiteboard: `# Whiteboard Style Guide

## Visual Characteristics
- Hand-drawn sketch appearance
- Black or dark marker on white background
- Simple, iconic representations
- Arrows and connectors for flow
- Minimal but clear illustrations
- Visible marker strokes
- Quick-sketch aesthetic

## Color Palette
- Primarily black on white
- Optional: one accent color (red, blue, green)
- Clean, high-contrast appearance
- No gradients or shading
- Accent color for emphasis only
- Gray for secondary elements
- Red for important callouts
- Blue for highlights

## Typography
- Handwritten marker style
- ALL CAPS for readability
- Simple, clean letterforms
- Slightly imperfect alignment
- Underlines for emphasis
- Boxes around key terms
- Arrows pointing to labels
- Size variation for hierarchy
- No fancy fonts - pure handwriting

## Character Guidelines
- Stick figures or simple iconic people
- Circle heads with minimal facial features
- Dot eyes, simple curved mouth
- Basic body shapes (rectangles, lines)
- Distinguishing feature: hat, glasses, or hair shape
- Consistent stick figure proportions
- Action poses shown through body angle
- No detailed anatomy
- Same simple identifier across all clips
- Emotion through posture, not facial detail

## Background & Environment
- Pure white or light gray background
- Minimal environmental detail
- Simple box frames for scenes
- Floor lines for grounding
- Basic shapes for objects
- Icons over detailed drawings
- Clean, uncluttered space

## Mood & Atmosphere
- Educational, explanatory
- Approachable, non-intimidating
- Clear, logical
- Friendly, helpful
- Energetic but focused
- "Thinking through" feeling
- Collaborative, inclusive

## Lighting
- None - flat presentation
- No shadows
- Pure white background glow
- Accent color can create "highlight" effect
- Everything evenly visible

## Narration Style
- Clear, direct explanations
- Teacher/guide voice
- Step-by-step logical flow
- "Let me show you" approach
- Conversational but educational
- Short, digestible sentences
- Pause for visual elements
- Enthusiastic but not over-the-top

## Composition Rules
- Left-to-right or top-to-bottom flow
- Clear visual hierarchy
- Icons and symbols over detailed drawings
- Text labels integrated naturally
- Whitespace for clarity
- Numbered steps when sequential
- Boxes to group related concepts

## Image Prompt Additions
Always include: "whiteboard drawing style, hand-drawn sketch, black marker on white, simple iconography, educational diagram, clean lines, stick figures, minimal design"

## Avoid
- Complex detailed illustrations
- Multiple colors (beyond one accent)
- Photorealistic elements
- Shading or gradients
- Cluttered compositions
- Detailed character anatomy
- Realistic facial features
- Fancy typography
- Decorative elements`,

  classic: `# Classic Style Guide

## Visual Characteristics
- Professional, polished illustrations
- Balanced realism and stylization
- Soft shadows and dimensional lighting
- Clean, refined execution
- Timeless, versatile aesthetic
- Consistent rendering quality
- Digital painting appearance

## Color Palette
- Natural, balanced colors
- Professional corporate tones
- Harmonious combinations
- Subtle gradients for depth
- Primary: navy, forest green, burgundy
- Secondary: warm grays, tans, cream
- Accent: gold, coral, teal
- Shadows: colored, not pure black
- Highlights: warm white, not pure white

## Typography
- Clean, professional sans-serif
- Classic serif for formal contexts
- Consistent font family throughout
- Proper hierarchy (H1, H2, body)
- Well-kerned, properly spaced
- Subtle drop shadows if needed
- Navy or dark gray text preferred
- White text on dark backgrounds
- No decorative or novelty fonts

## Character Guidelines
- Proportional, realistic body structure
- Clean, friendly facial features
- Professional or neutral expressions
- Consistent skin tone and lighting
- Recognizable through clothing and features
- Natural hair with subtle highlights
- Eyes with depth but not overly detailed
- Consistent age appearance across clips
- Same outfit or color scheme throughout
- Diverse, inclusive representation

## Background & Environment
- Realistic but stylized settings
- Appropriate depth of field
- Professional environments
- Natural landscapes when relevant
- Clean, organized interiors
- Atmospheric perspective
- Contextually appropriate scenes

## Mood & Atmosphere
- Professional, trustworthy
- Approachable expertise
- Calm confidence
- Educational authority
- Warm but not casual
- Respectful, inclusive
- Timeless quality

## Lighting
- Natural, believable lighting
- Soft shadows with colored edges
- Three-point lighting setup
- Rim lights for separation
- Ambient fill light
- Golden hour for warmth
- Soft studio lighting for portraits

## Narration Style
- Professional, authoritative tone
- Clear, well-paced delivery
- Sophisticated vocabulary (accessible)
- Balanced sentences, proper grammar
- Confident but not condescending
- Informative and engaging
- Measured, thoughtful pacing
- Trustworthy expert voice

## Composition Rules
- Classical composition principles
- Clear focal points
- Professional framing
- Balanced negative space
- Readable at various sizes
- Rule of thirds application
- Leading lines to guide eye

## Image Prompt Additions
Always include: "classic illustration style, professional artwork, polished rendering, balanced composition, refined execution, timeless design, natural lighting, high quality digital art"

## Avoid
- Trendy or dated aesthetics
- Overly stylized approaches
- Harsh or jarring colors
- Experimental compositions
- Inconsistent rendering quality
- Changing character appearance between clips
- Inconsistent lighting on characters
- Casual or unprofessional elements
- Overly complex backgrounds`,

  cinematic: `# Cinematic Style Guide

## Visual Characteristics
- Widescreen letterbox framing (2.35:1 feel)
- Dramatic depth of field with bokeh
- Film grain and subtle color grading
- High production value aesthetic
- Movie-like scene compositions
- Atmospheric lighting effects
- Professional color correction look

## Color Palette
- Teal and orange color grading (blockbuster look)
- Deep shadows with lifted blacks
- Rich, cinematic contrast
- Desaturated midtones with saturated highlights
- Primary: deep teal, burnt orange, slate gray
- Secondary: gold, burgundy, midnight blue
- Skin tones: warm, slightly orange-pushed
- Shadows: cool blue or teal tinted

## Typography
- Elegant, thin sans-serif fonts
- Movie title styling
- Subtle tracking (letter spacing)
- White or gold text on dark backgrounds
- Minimal text, let visuals speak
- Lower-third style for labels
- Fade transitions for text

## Character Guidelines
- Realistic proportions with stylized rendering
- Dramatic expressions and poses
- Strong silhouettes against backgrounds
- Rim lighting on faces and figures
- Consistent wardrobe color palette
- Hero framing for main subjects
- Cinematic eye reflections
- Characters lit like movie stars
- CONTINUITY: Same character must have identical face, hair color, and costume across ALL clips
- CONTINUITY: Maintain consistent body type, skin tone, and distinguishing features throughout

## Background & Environment
- Epic, sweeping landscapes
- Detailed, atmospheric environments
- Fog, haze, and atmospheric depth
- Dramatic skies with volumetric clouds
- Urban: neon reflections, wet streets
- Nature: golden hour, dramatic weather

## Mood & Atmosphere
- Epic, dramatic, emotional
- Tension and release
- Larger-than-life feeling
- Emotionally resonant
- Storytelling focused
- Suspenseful when needed
- Triumphant or melancholic

## Lighting
- Three-point cinematic lighting
- Strong key light with soft fill
- Dramatic rim/back lighting
- Practical lights in scenes
- Golden hour and blue hour
- Lens flares (subtle, motivated)
- Volumetric light rays

## Narration Style
- Dramatic, measured pacing
- Movie trailer energy when needed
- Deep, resonant voice quality
- Pause for dramatic effect
- Build tension and release
- Epic, inspiring tone
- Clear enunciation

## Composition Rules
- Rule of thirds with purpose
- Leading lines to subject
- Foreground, midground, background layers
- Frame within frame compositions
- Symmetrical when impactful
- Dutch angles for tension
- Negative space for drama

## Image Prompt Additions
Always include: "cinematic style, movie lighting, film grain, dramatic composition, depth of field, teal and orange color grading, widescreen aesthetic, high production value, atmospheric"

## Avoid
- Flat lighting
- Centered compositions without purpose
- Oversaturated colors
- Cartoonish elements
- Low-quality rendering
- Snapchat/social media aesthetics
- Harsh, unflattering light`,

  isometric: `# Isometric Style Guide

## Visual Characteristics
- 30-degree isometric projection
- No vanishing points (parallel lines)
- Clean, geometric construction
- 3D appearance without perspective
- Miniature diorama feeling
- Precise, mathematical angles
- Detailed micro-worlds

## Color Palette
- Bright, clean colors
- Distinct color coding per element
- Soft shadows for depth
- Pastel to vibrant range
- Primary: coral, sky blue, mint green
- Secondary: soft yellow, lavender, peach
- Accent: bright orange, electric blue
- Shadows: soft gray, never black

## Typography
- Clean sans-serif fonts
- Isometric text when applicable
- Labels floating above elements
- Color-coded text matching elements
- Simple, readable at small sizes
- Minimal text, visual focus
- Rounded, friendly letterforms

## Character Guidelines
- Simplified, cute proportions
- Isometric-aligned poses
- Limited detail, iconic shapes
- Consistent head-to-body ratio
- Characters as part of the scene
- Clear silhouettes from above
- Same character scaled consistently
- Distinct through color/accessories
- CONTINUITY: Same character must have identical colors, shape, and accessories across ALL clips
- CONTINUITY: Maintain consistent proportions and distinguishing features throughout

## Background & Environment
- Cross-section views
- Layered, explorable spaces
- Urban: buildings, streets, parks
- Interior: rooms, offices, homes
- Detailed props and furniture
- Hidden details reward attention
- Seamless tile-able designs

## Mood & Atmosphere
- Playful, approachable
- Organized, systematic
- Educational, informative
- Cute but professional
- Optimistic, bright
- Methodical, logical
- Satisfying order

## Lighting
- Soft, consistent top-right light source
- Gentle shadows (45-degree)
- No harsh shadows
- Subtle ambient occlusion
- Even illumination overall
- Slight gradient on surfaces

## Narration Style
- Clear, methodical explanations
- Step-by-step breakdowns
- Friendly, guide-like tone
- Point out visual elements
- Systematic progression
- Enthusiastic but calm
- Educational focus

## Composition Rules
- Subject centered or rule of thirds
- Camera at consistent isometric angle
- Hierarchy through size and position
- Visual flow through arrangement
- Layered depth front to back
- Consistent scale throughout
- White space for breathing room

## Image Prompt Additions
Always include: "isometric 3D style, 30-degree angle, diorama view, clean geometry, cute miniature world, no perspective distortion, detailed scene, soft shadows, vibrant colors"

## Avoid
- Perspective distortion
- Inconsistent angles
- Realistic proportions
- Dark or moody colors
- Complex textures
- Cluttered compositions
- Varying camera angles`,

  flat: `# Flat Design Style Guide

## Visual Characteristics
- No gradients, shadows, or 3D effects
- Bold, solid color fills
- Clean geometric shapes
- Minimal visual elements
- Modern, digital aesthetic
- SVG/vector appearance
- Crisp, sharp edges

## Color Palette
- Bold, saturated flat colors
- High contrast combinations
- Limited palette (4-6 colors)
- Material design influence
- Primary: electric blue, coral red, grass green
- Secondary: amber yellow, deep purple, teal
- Accent: bright pink, lime, orange
- Backgrounds: white, light gray, dark navy

## Typography
- Clean sans-serif (Helvetica, Roboto style)
- Bold weights for headlines
- Consistent font family
- Large, readable sizes
- Strong hierarchy through size
- Minimal decorative elements
- Left-aligned or centered

## Character Guidelines
- Geometric, simplified figures
- Circle heads, rectangular bodies
- Flat color fills only
- Minimal facial features
- Distinct through shape and color
- Consistent proportions
- No outlines or minimal outlines
- Icon-like simplicity
- CONTINUITY: Same character must use identical colors, shapes, and proportions across ALL clips
- CONTINUITY: Distinguishing features (hat, glasses, color) must remain constant

## Background & Environment
- Solid color backgrounds
- Geometric shape accents
- Minimal environmental detail
- Abstract representations
- Clean, spacious layouts
- Shapes as visual interest
- No textures or patterns

## Mood & Atmosphere
- Modern, professional
- Clean, efficient
- Approachable, friendly
- Contemporary, fresh
- Confident, direct
- Minimalist clarity
- Tech-forward feeling

## Lighting
- None - completely flat
- No shadows whatsoever
- No highlights or gradients
- Depth through layering only
- Color contrast for separation

## Narration Style
- Direct, concise language
- Modern vocabulary
- Punchy sentences
- Professional but friendly
- Clear, efficient delivery
- Confident tone
- No unnecessary words

## Composition Rules
- Grid-based layouts
- Strong visual hierarchy
- Generous whitespace
- Asymmetric balance
- Scale contrast for emphasis
- Overlapping shapes for depth
- Clear focal points

## Image Prompt Additions
Always include: "flat design style, no shadows, no gradients, solid colors, geometric shapes, vector art aesthetic, modern minimalist, clean composition, bold colors"

## Avoid
- Any 3D effects
- Gradients or shading
- Realistic textures
- Complex details
- Decorative elements
- Subtle color variations
- Shadows of any kind
- Photorealistic elements`,

  comic: `# Comic Book Style Guide

## Visual Characteristics
- Bold black outlines (varied line weight)
- Halftone dot shading
- Dynamic action panels
- Dramatic perspectives
- Speech bubbles and captions
- Motion lines and impact effects
- Ben-Day dots for color

## Color Palette
- CMYK print colors
- Bold primaries: red, blue, yellow
- Limited color palette per scene
- Flat colors with halftone shading
- White highlights, black shadows
- Primary: superhero red, royal blue, canary yellow
- Secondary: purple, green, orange
- Skin: simplified warm tones

## Typography
- Comic book lettering style
- ALL CAPS in speech bubbles
- Bold for emphasis
- Sound effects as art (POW, WHAM)
- Varied bubble shapes for tone
- Thought bubbles: cloud shape
- Caption boxes: rectangular
- Hand-lettered appearance

## Character Guidelines
- Heroic proportions (broad shoulders, slim waist)
- Strong, dynamic poses
- Expressive faces with bold features
- Consistent costume/outfit
- Dramatic capes or accessories
- Action-ready stances
- Clear emotional expressions
- Defined musculature or silhouette
- CONTINUITY: Same hero must have identical costume, colors, and face design across ALL clips
- CONTINUITY: Maintain consistent body type, hair, and signature accessories throughout

## Background & Environment
- Speed lines for motion
- Dramatic cityscapes
- Explosive action backgrounds
- Simple to complex as needed
- Perspective exaggeration
- Environmental storytelling
- Detailed when calm, abstract when action

## Mood & Atmosphere
- Heroic, adventurous
- Dramatic tension
- Good vs evil clarity
- Exciting, action-packed
- Larger than life
- Emotional highs and lows
- Triumphant spirit

## Lighting
- High contrast noir shadows
- Dramatic rim lighting
- Silhouette moments
- Spotlight effects
- Cross-hatching for shade
- Strong light/dark division

## Narration Style
- Dramatic, punchy delivery
- Short, impactful sentences
- Exclamation points welcome
- Heroic vocabulary
- Building tension
- Sound effects in voice
- Clear good/evil framing

## Composition Rules
- Dynamic diagonal compositions
- Extreme angles (worm's eye, bird's eye)
- Breaking the frame effect
- Panel-style framing
- Scale extremes for impact
- Overlapping elements
- Eye flow through action

## Image Prompt Additions
Always include: "comic book style, bold outlines, halftone dots, dynamic composition, superhero aesthetic, action poses, dramatic lighting, Ben-Day dots, speech bubble ready"

## Avoid
- Soft, blended edges
- Realistic proportions
- Muted colors
- Static poses
- Subtle expressions
- Photorealistic rendering
- Gradient shading
- Minimal contrast`,

  neon: `# Neon/Cyberpunk Style Guide

## Visual Characteristics
- Glowing neon light effects
- Dark backgrounds with bright accents
- Cyberpunk/synthwave aesthetic
- Reflective wet surfaces
- Grid patterns and digital elements
- Holographic effects
- Retro-futuristic technology

## Color Palette
- Electric neon colors on black
- Hot pink/magenta dominant
- Electric cyan/blue accents
- Purple gradients
- Primary: neon pink, electric cyan, purple
- Secondary: neon green, orange, yellow
- Background: deep black, dark purple, navy
- Glow: white core, colored outer glow

## Typography
- Glowing neon text effects
- Retro-futuristic fonts
- Outline or hollow letters
- Digital/tech fonts
- Japanese aesthetic influence
- Horizontal lines through text
- Chrome or metallic accents
- Scanning line effects

## Character Guidelines
- Cyberpunk fashion (leather, chrome)
- Neon hair highlights or streaks
- Reflective sunglasses
- Tech accessories (earpieces, implants)
- Silhouettes with neon edges
- Dramatic rim lighting
- Futuristic yet gritty
- Consistent neon accent color
- CONTINUITY: Same character must have identical face, hair color, and cyberwear across ALL clips
- CONTINUITY: Maintain consistent outfit, accessories, and neon accent colors throughout

## Background & Environment
- Dark city streets at night
- Neon signs everywhere
- Rain and wet reflections
- Holographic advertisements
- Futuristic architecture
- Grid floors (Tron-like)
- Fog with colored light
- Tech interfaces and screens

## Mood & Atmosphere
- Edgy, futuristic
- Mysterious, noir
- High-tech, low-life
- Rebellious energy
- Night-time vibes
- Underground culture
- Electric intensity

## Lighting
- Neon as primary light source
- Multiple colored lights
- Strong color contrast
- Rim lighting in neon colors
- Reflections on surfaces
- Volumetric light through fog
- No natural light

## Narration Style
- Cool, confident delivery
- Tech vocabulary
- Mysterious undertones
- Punchy, modern sentences
- Slightly dystopian perspective
- Electronic music pacing
- Dramatic pauses

## Composition Rules
- Dark negative space
- Neon as focal points
- Reflections for depth
- Symmetry with tech grids
- Leading lines of light
- High contrast areas
- Depth through fog/haze

## Image Prompt Additions
Always include: "neon cyberpunk style, glowing lights, dark background, synthwave aesthetic, electric colors, wet reflections, futuristic, pink and cyan neon, atmospheric fog"

## Avoid
- Daylight scenes
- Natural colors
- Soft, muted palettes
- Pastoral or nature scenes
- Warm, cozy feeling
- Traditional aesthetics
- Flat lighting
- Desaturated colors`,

  oil: `# Oil Painting Style Guide

## Visual Characteristics
- Visible brushstroke texture
- Rich, layered paint appearance
- Classical art techniques
- Impasto highlights
- Glazed shadows
- Canvas texture visible
- Masterwork quality

## Color Palette
- Rich, deep colors
- Old master color schemes
- Earth tones foundation
- Jewel tone accents
- Primary: burnt sienna, ultramarine, cadmium yellow
- Secondary: venetian red, viridian, ochre
- Shadows: raw umber, paynes gray
- Highlights: naples yellow, titanium white

## Typography
- Classical serif fonts
- Gold leaf effects
- Minimal text preferred
- Painted letter appearance
- Elegant, timeless fonts
- Integrated into composition
- Formal, artistic presentation

## Character Guidelines
- Classical portraiture style
- Realistic proportions
- Rich fabric textures
- Dramatic light on face
- Expressive, soulful eyes
- Careful attention to hands
- Period-appropriate when relevant
- Consistent lighting direction
- CONTINUITY: Same subject must have identical face, costume, and pose style across ALL clips
- CONTINUITY: Maintain consistent skin tones, hair, and clothing colors throughout

## Background & Environment
- Atmospheric landscapes
- Dramatic skies (Dutch masters)
- Rich interior scenes
- Still life elements
- Chiaroscuro depth
- Nature with grandeur
- Historical settings

## Mood & Atmosphere
- Timeless, classical
- Emotional depth
- Contemplative, serious
- Grandeur and beauty
- Romantic sensibility
- Artistic reverence
- Museum quality

## Lighting
- Rembrandt lighting on faces
- Single dramatic light source
- Deep shadows, bright highlights
- Warm light, cool shadows
- Candle or window light feel
- Sfumato soft edges
- Golden hour quality

## Narration Style
- Thoughtful, measured pace
- Poetic language choices
- Rich vocabulary
- Contemplative tone
- Historical gravitas
- Artistic sensibility
- Reverent delivery

## Composition Rules
- Classical composition (golden ratio)
- Triangular arrangements
- Clear focal hierarchy
- Foreground/background contrast
- Leading lines to subject
- Balanced asymmetry
- Dark corners vignette

## Image Prompt Additions
Always include: "oil painting style, visible brushstrokes, classical art, rich colors, dramatic lighting, canvas texture, museum quality, old master technique, impasto highlights"

## Avoid
- Flat digital appearance
- Bright neon colors
- Modern elements
- Clean vector look
- Cartoonish features
- Photorealistic rendering
- Minimal brushwork
- Contemporary subjects`,

  sketch: `# Sketch Style Guide

## Visual Characteristics
- Pencil or pen line work
- Cross-hatching for shading
- Rough, energetic strokes
- Unfinished edges
- Paper texture visible
- Artist's hand evident
- Spontaneous feeling

## Color Palette
- Primarily grayscale
- Optional single accent color
- Graphite gray tones
- Sepia for warmth option
- Primary: pencil gray, charcoal black
- Secondary: light gray, white paper
- Accent: single color (red, blue) if used
- Paper: cream, white, or tan

## Typography
- Hand-lettered appearance
- Sketchy, imperfect letters
- Labels and annotations style
- Slightly tilted baselines
- Varying line weight
- Simple, readable forms
- Note-taking aesthetic

## Character Guidelines
- Loose, gestural figures
- Proportional but not precise
- Expressive line quality
- Minimal detail, maximum gesture
- Consistent sketching style
- Motion through line direction
- Same character recognizable by silhouette

## Background & Environment
- Minimal backgrounds
- Suggestive lines only
- Focus on subject
- Gradient shading optional
- Loose environmental hints
- White space as design element
- Ground plane indication

## Mood & Atmosphere
- Creative, artistic
- Work-in-progress feeling
- Intellectual, thoughtful
- Authentic, unpolished
- Behind-the-scenes aesthetic
- Personal, intimate
- Exploratory energy

## Lighting
- Cross-hatching for shadows
- Directional through line density
- Highlights as paper showing through
- Soft gradients through pencil pressure
- Simple light/dark division
- Atmospheric through tone

## Narration Style
- Conversational, thinking aloud
- Explanatory, teaching tone
- "Let me show you" approach
- Comfortable with imperfection
- Casual but informative
- Artist's perspective
- Process-oriented

## Composition Rules
- Rule of thirds loosely applied
- Focal point through detail level
- Negative space important
- Overlapping for depth
- Scale variation for interest
- Diagonal energy
- Cropped edges acceptable

## Image Prompt Additions
Always include: "pencil sketch style, hand-drawn, cross-hatching, visible strokes, paper texture, artistic sketch, graphite drawing, loose linework, gestural"

## Avoid
- Clean digital lines
- Perfect symmetry
- Solid filled areas
- Photorealistic detail
- Multiple bright colors
- Polished finished look
- Stiff, rigid lines
- Over-rendered areas
- ANY meta-text like "CLIP", "Clip X of Y", "Part 1", "Section", "Chapter", "INTRO", "OUTRO" - NEVER include these
- Slide-like layouts or presentation formatting
- Text that references video structure or sequence`,

  papercut: `# Papercut Style Guide

## Visual Characteristics
- Layered paper cutout appearance
- Subtle drop shadows between layers
- Clean, cut edges
- Overlapping shapes creating depth
- Paper texture on surfaces
- Handcrafted aesthetic
- Dimensional but flat

## Color Palette
- Solid paper colors
- Craft paper tones
- Limited, harmonious palette
- White shadows between layers
- Primary: kraft brown, forest green, coral
- Secondary: mustard, navy, cream
- Accent: bright red, teal, gold
- Paper whites for highlights

## Typography
- Cut-out letter forms
- Layered text effects
- Paper-craft appearance
- Bold, simple shapes
- Drop shadow placement
- Single color per letter
- Slightly imperfect edges

## Character Guidelines
- Simplified silhouettes
- Layered paper construction
- Limited detail, strong shapes
- Consistent paper color palette
- Side profiles work well
- Dimensional through layering
- Folk art influence
- Same silhouette throughout

## Background & Environment
- Layered landscape cutouts
- Scenic depth through layers
- Folk art inspired scenes
- Nature: trees, mountains, clouds
- Urban: building silhouettes
- Minimal but effective
- Shadow creates depth

## Mood & Atmosphere
- Handcrafted, artisanal
- Whimsical, charming
- Storybook quality
- Warm, inviting
- Craft project feeling
- Nostalgic warmth
- Folk tradition

## Lighting
- Soft shadows between layers
- Light from above/behind
- Paper edge highlights
- No gradients on surfaces
- Depth through shadow only
- Natural, soft illumination

## Narration Style
- Warm, storytelling voice
- Folk tale cadence
- Simple, clear language
- Gentle, inviting tone
- Once upon a time feeling
- Measured, calm pacing
- Personal, intimate

## Composition Rules
- Clear foreground/background layers
- Overlapping shapes essential
- Silhouettes against contrasting layers
- Depth through shadow distance
- Balanced arrangements
- Folk art symmetry options
- Clear visual hierarchy

## Image Prompt Additions
Always include: "papercut art style, layered paper, cut-out shapes, drop shadows, craft paper texture, dimensional layers, handcrafted look, folk art aesthetic"

## Avoid
- Gradients on surfaces
- Photorealistic elements
- Complex details
- Digital perfection
- 3D realistic rendering
- Multiple light sources
- Transparent effects
- Blurred edges`,

  popart: `# Pop Art Style Guide

## Visual Characteristics
- Bold, graphic imagery
- Halftone dot patterns
- High contrast colors
- Repetition and patterns
- Commercial art aesthetic
- Warhol/Lichtenstein influence
- Mass media imagery

## Color Palette
- Primary colors dominant
- High saturation, flat fills
- Black outlines
- Limited palette per image
- Primary: fire engine red, primary yellow, cyan
- Secondary: hot pink, lime green, orange
- Black for outlines and contrast
- White for highlights and dots

## Typography
- Bold, impactful fonts
- Comic book lettering
- Advertising slogans style
- ALL CAPS frequently
- Outlined or shadowed
- Words as visual elements
- Onomatopoeia welcome
- Benday dot backgrounds

## Character Guidelines
- Iconic, simplified portraits
- Celebrity/icon treatment
- High contrast faces
- Flat color fills
- Bold outline defining features
- Glamorous or dramatic poses
- Consistent pop treatment
- Screen print aesthetic
- CONTINUITY: Same icon must have identical face shape, colors, and style across ALL clips
- CONTINUITY: Maintain consistent pop art treatment and color palette throughout

## Background & Environment
- Solid color backgrounds
- Dot pattern fills
- Minimal environmental detail
- Abstract graphic shapes
- Consumer product imagery
- Urban/commercial contexts
- Pattern repetition

## Mood & Atmosphere
- Bold, attention-grabbing
- Ironic, playful
- Commercial, consumable
- Iconic, memorable
- Critique through celebration
- Mass appeal energy
- Contemporary commentary

## Lighting
- Flat, graphic lighting
- High contrast shadows
- Posterized look
- No subtle gradients
- Strong light/dark division
- Halftone for midtones

## Narration Style
- Punchy, advertising style
- Short, memorable phrases
- Exclamatory energy
- Modern, relevant references
- Ironic undertones optional
- Bold statements
- Repetition for effect

## Composition Rules
- Bold, graphic layouts
- Central focus on icon
- Repetition in grids
- Scale for impact
- Color blocking
- Flat design principles
- Words integrated as image

## Image Prompt Additions
Always include: "pop art style, bold colors, halftone dots, high contrast, graphic design, Warhol Lichtenstein influence, commercial art aesthetic, flat colors, black outlines"

## Avoid
- Subtle color variations
- Realistic shading
- Soft edges
- Muted palettes
- Traditional art styles
- Complex backgrounds
- Delicate details
- Photorealism`,

  storybook: `# Storybook Style Guide

## Visual Characteristics
- Children's book illustration aesthetic
- Warm, inviting artwork
- Gentle, rounded shapes
- Textured, hand-painted look
- Whimsical details
- Soft edges and forms
- Cozy, safe feeling

## Color Palette
- Warm, friendly colors
- Soft pastels with depth
- Golden, cozy tones
- Primary: warm red, sunny yellow, sky blue
- Secondary: leaf green, soft orange, lavender
- Skin: warm peachy with rosy cheeks
- Backgrounds: soft cream, gentle blue
- Shadows: warm purple or brown

## Typography
- Friendly, rounded fonts
- Hand-lettered appearance
- Playful but readable
- Large, clear letters
- Storybook title styling
- Chapter headers
- Gentle, approachable
- Never scary or sharp

## Character Guidelines
- Adorable, approachable characters
- Large expressive eyes
- Rounded, soft features
- Slightly oversized heads
- Warm, friendly expressions
- Consistent, recognizable design
- Relatable children or cute creatures
- Cozy clothing and accessories

## Background & Environment
- Enchanted forests
- Cozy cottages
- Magical gardens
- Friendly villages
- Safe, warm interiors
- Nature with personality
- Hidden details for discovery
- Day scenes preferred

## Mood & Atmosphere
- Safe, nurturing
- Magical wonder
- Gentle adventure
- Warm and cozy
- Encouraging, positive
- Bedtime story feeling
- Imagination-sparking

## Lighting
- Warm, golden light
- Soft shadows
- Glowing windows
- Magical sparkles
- Daylight or lamplight
- No harsh contrasts
- Comforting illumination

## Narration Style
- Gentle, warm voice
- Story-telling cadence
- Simple, clear words
- Encouraging tone
- "Once upon a time" energy
- Age-appropriate vocabulary
- Calm, measured pacing
- Wonder and discovery

## Composition Rules
- Clear, simple layouts
- Central characters
- Safe, enclosed spaces
- Eye-level perspective
- Nothing threatening
- Warm color dominance
- Readable at all sizes

## Image Prompt Additions
Always include: "children's book illustration, storybook style, warm colors, cute characters, whimsical, hand-painted texture, soft edges, cozy atmosphere, friendly design"

## Avoid
- Scary or threatening elements
- Dark, moody palettes
- Sharp, angular shapes
- Complex compositions
- Adult themes or imagery
- Realistic violence
- Overwhelming detail
- Cold, stark aesthetics`,

  pixel: `# Pixel Art Style Guide

## Visual Characteristics
- Visible pixel grid aesthetic
- Limited resolution look
- Retro video game style
- Deliberate aliasing
- Dithering for gradients
- 8-bit or 16-bit feel
- Nostalgic gaming aesthetic

## Color Palette
- Limited color palette (16-64 colors)
- Indexed color appearance
- High contrast for readability
- Retro gaming colors
- Primary: NES/SNES color ranges
- Bright, saturated options
- Black outlines optional
- Dithering for color mixing

## Typography
- Pixel fonts exclusively
- 8-bit style lettering
- Fixed-width characters
- Limited sizes available
- Retro game UI style
- Readable at small sizes
- Bitmap aesthetic

## Character Guidelines
- Sprite-style characters
- Limited animation frames look
- Distinctive silhouettes
- Recognizable at small sizes
- Consistent pixel density
- Same character sprite throughout
- Clear idle poses
- Expressive within limitations

## Background & Environment
- Tile-based backgrounds
- Side-scrolling or top-down views
- Repeating pattern elements
- Game level aesthetics
- Parallax layer possibility
- Platform game worlds
- Dungeon or overworld styles

## Mood & Atmosphere
- Nostalgic, retro
- Playful, game-like
- Achievement-oriented
- Adventure energy
- Collectible, completionist
- Upbeat, positive
- Gaming culture celebration

## Lighting
- Limited through color choice
- Highlights as lighter pixels
- Shadows as darker pixels
- No smooth gradients
- Dithering for transitions
- Simple light direction

## Narration Style
- Upbeat, gaming energy
- Quest/mission framing
- Achievement unlocked tone
- Retro reference friendly
- Short, punchy sentences
- Level-up enthusiasm
- Player guidance style

## Composition Rules
- Grid-aligned elements
- Clear sprite boundaries
- Consistent pixel scale
- Platform game layouts
- HUD-ready spacing
- Readable at native size
- Tile-friendly design

## Image Prompt Additions
Always include: "pixel art style, 8-bit aesthetic, retro gaming, visible pixels, limited color palette, video game sprite, nostalgic, crisp pixels, game art"

## Avoid
- Anti-aliasing
- Smooth gradients
- High resolution details
- Photorealistic elements
- Modern 3D graphics
- Sub-pixel rendering
- Blurry scaling
- Mixed resolution elements`,

  minimalist: `# Minimalist Style Guide

## Visual Characteristics
- Extreme simplicity
- Essential elements only
- Maximum negative space
- Clean, precise execution
- Reduction to core forms
- Visual breathing room
- Less is more philosophy

## Color Palette
- Monochromatic or limited
- Black, white, one accent
- Neutral foundations
- Single bold color accent
- Primary: black, white, gray
- Accent: single color (red, blue, or gold)
- No gradients
- High contrast when needed

## Typography
- Ultra-clean sans-serif
- Thin or regular weights
- Generous letter spacing
- Minimal text usage
- Helvetica/Swiss style
- Size hierarchy through scale
- White space around text

## Character Guidelines
- Iconic silhouettes
- Minimal features
- Geometric simplification
- Single-line drawings possible
- No unnecessary detail
- Recognizable through shape
- Consistent abstraction level

## Background & Environment
- Solid colors or white
- No patterns or textures
- Implied environments
- Single horizon line maximum
- Abstract space
- Infinite white/black void
- Architectural simplicity

## Mood & Atmosphere
- Calm, focused
- Sophisticated, refined
- Intellectual, thoughtful
- Zen-like clarity
- Premium quality feel
- Confident restraint
- Contemporary elegance

## Lighting
- Flat or single shadow
- No complex lighting
- Silhouette option
- Clean shadow shapes
- High-key or low-key
- No gradients

## Narration Style
- Concise, every word counts
- Thoughtful pauses
- Zen-like calm
- Clear, direct statements
- Sophisticated vocabulary
- Measured, intentional
- Quality over quantity

## Composition Rules
- Rule of thirds strictly
- Massive negative space
- Single focal point
- Asymmetric balance
- Geometric alignment
- Clean edges
- Visual quiet

## Image Prompt Additions
Always include: "minimalist design, clean composition, negative space, simple shapes, essential elements only, modern aesthetic, sophisticated simplicity, high contrast"

## Avoid
- Decorative elements
- Multiple focal points
- Busy backgrounds
- Complex patterns
- Gradients
- Detailed textures
- Clutter of any kind
- Unnecessary elements`,

  infographic: `# Infographic Style Guide

## Visual Characteristics
- Data visualization focus
- Charts, graphs, icons
- Clear information hierarchy
- Visual statistics
- Flow diagrams
- Comparison layouts
- Educational graphics

## Color Palette
- Color-coded categories
- Clear differentiation
- Professional combinations
- Primary: data blue, accent orange, neutral gray
- Secondary: green for positive, red for negative
- Category colors: distinct, accessible
- Backgrounds: white or light gray
- Text: dark gray or navy

## Typography
- Clear sans-serif fonts
- Strong hierarchy
- Numbers prominent
- Labels and captions
- Data callouts
- Percentage displays
- Legend text
- Multiple sizes for hierarchy

## Character Guidelines
- Icon-style people
- Isotype influence
- Statistical representations
- Diverse, inclusive icons
- Consistent icon style
- Size for comparison
- Minimal detail

## Background & Environment
- Clean, gridded backgrounds
- Section dividers
- Flow arrows
- Process timelines
- Comparison panels
- White space for clarity
- Organized layouts

## Mood & Atmosphere
- Informative, educational
- Professional, trustworthy
- Clear, logical
- Engaging data
- Authority through facts
- Accessible knowledge
- Shareable insights

## Lighting
- Flat, no shadows
- Clean presentation
- No atmospheric effects
- Icons self-lit
- High visibility

## Narration Style
- Fact-based delivery
- Statistical references
- Clear explanations
- Data-driven points
- "According to..." framing
- Numbers emphasized
- Comparative language

## Composition Rules
- Grid-based layouts
- Clear sections
- Visual hierarchy
- Reading flow (Z or F pattern)
- Grouping related data
- Contrast for emphasis
- White space between sections

## Image Prompt Additions
Always include: "infographic style, data visualization, clean layout, icons and charts, educational graphic, information design, statistics visualization, professional presentation"

## Avoid
- Decorative-only elements
- Misleading visualizations
- Cluttered data
- Inconsistent icon styles
- Poor color contrast
- Unreadable text sizes
- Confusing flow
- Artistic ambiguity`,

  documentary: `# Documentary Style Guide

## Visual Characteristics
- Photorealistic illustration
- News/journalism aesthetic
- Historical accuracy when relevant
- Archival photo reference
- Serious, factual presentation
- Real-world authenticity
- Evidence-based visuals

## Color Palette
- Natural, realistic colors
- Slightly desaturated
- Documentary film grade
- Period-accurate when historical
- Primary: earth tones, natural hues
- Secondary: muted blues, warm grays
- Skin: realistic, diverse
- Environments: authentic to subject

## Typography
- Clean, authoritative fonts
- News/documentary styling
- Lower-third graphics
- Date and location stamps
- Subtitle appearance
- Serious, readable fonts
- No decorative elements

## Character Guidelines
- Realistic proportions
- Diverse representation
- Period-accurate clothing
- Natural expressions
- Interview-style framing
- Respectful portrayal
- Real people aesthetic
- CONTINUITY: Same person must have identical face, hair, and clothing across ALL clips
- CONTINUITY: Maintain consistent age, ethnicity, and physical features throughout

## Background & Environment
- Real-world locations
- Historical settings when needed
- Authentic environments
- Evidence and artifacts
- Archive imagery style
- Location-specific details
- Geographic accuracy

## Mood & Atmosphere
- Serious, informative
- Respectful gravity
- Educational authority
- Historical weight
- Truth-seeking
- Contemplative
- Important subject matter

## Lighting
- Natural, realistic lighting
- Interview lighting setups
- Period-accurate light sources
- Documentary cinematography
- Available light aesthetic
- Soft, truthful illumination

## Narration Style
- Authoritative, measured
- Documentary narrator voice
- Journalistic objectivity
- Historical context
- Expert interview tone
- Serious but accessible
- Fact-based delivery

## Composition Rules
- Interview-style framing
- B-roll compositions
- Evidence presentation
- Timeline layouts
- Map and location shots
- Archive integration
- Traditional documentary shots

## Image Prompt Additions
Always include: "documentary style, realistic illustration, journalistic aesthetic, authentic representation, historical accuracy, news photography influence, serious tone, factual presentation"

## Avoid
- Fantasy elements
- Cartoonish styling
- Inaccurate representations
- Sensationalism
- Decorative flourishes
- Entertainment-focused aesthetics
- Misleading imagery
- Disrespectful portrayals`,

  gothic: `# Gothic Style Guide

## Visual Characteristics
- Dark, dramatic atmosphere
- Victorian/medieval influence
- Ornate decorative elements
- Cathedral architecture
- Dramatic shadows
- Romantic darkness
- Mysterious beauty

## Color Palette
- Deep, rich darks
- Jewel tones as accents
- Black dominant
- Primary: black, deep purple, blood red
- Secondary: midnight blue, forest green, gold
- Accent: silver, pale blue, burgundy
- Highlights: moonlight white, candle gold
- Shadows: pure black to deep purple

## Typography
- Gothic/blackletter fonts
- Ornate serif options
- Decorative capitals
- Medieval manuscript style
- Elegant, dramatic
- Scrollwork accents
- Old English influence

## Character Guidelines
- Elegant, dramatic figures
- Victorian or medieval dress
- Pale skin with dramatic features
- Dark clothing with rich details
- Mysterious expressions
- Dramatic poses
- Consistent dark elegance
- Ornate accessories
- CONTINUITY: Same character must have identical face, costume, and jewelry across ALL clips
- CONTINUITY: Maintain consistent hair color, skin tone, and clothing style throughout

## Background & Environment
- Gothic architecture
- Castles and cathedrals
- Moonlit scenes
- Graveyards and crypts
- Dark forests
- Candlelit interiors
- Fog and mist
- Gargoyles and statues

## Mood & Atmosphere
- Mysterious, romantic
- Darkly beautiful
- Dramatic tension
- Melancholic elegance
- Supernatural possibility
- Romantic tragedy
- Haunting beauty

## Lighting
- Candlelight and moonlight
- Dramatic chiaroscuro
- Deep shadows
- Rim lighting
- Stained glass glow
- Atmospheric light rays
- No bright daylight

## Narration Style
- Dramatic, poetic
- Rich, evocative language
- Mysterious undertones
- Victorian vocabulary
- Measured, deliberate
- Romantic sensibility
- Dark fairy tale energy

## Composition Rules
- Dramatic symmetry
- Vertical emphasis
- Ornate framing
- Dark vignettes
- Architectural framing
- Mysterious focal points
- Layered atmosphere

## Image Prompt Additions
Always include: "gothic style, dark atmosphere, Victorian aesthetic, dramatic lighting, ornate details, mysterious mood, cathedral architecture, romantic darkness, moonlit scene"

## Avoid
- Bright, cheerful colors
- Modern elements
- Casual compositions
- Flat lighting
- Minimalist aesthetics
- Horror/gore (unless appropriate)
- Cheap darkness
- Cartoonish elements`,

  pastel: `# Pastel Style Guide

## Visual Characteristics
- Soft, muted color palette
- Gentle, dreamy aesthetic
- Light, airy feeling
- Subtle gradients
- Smooth, calming visuals
- Kawaii influence optional
- Delicate, refined execution

## Color Palette
- Desaturated, soft tones
- Light values dominant
- Harmonious combinations
- Primary: baby pink, powder blue, mint green
- Secondary: lavender, peach, cream yellow
- Accent: soft coral, sage, lilac
- Backgrounds: off-white, pale gray
- Shadows: slightly darker pastels

## Typography
- Rounded, friendly fonts
- Light to regular weights
- Soft, approachable
- Clean sans-serif
- Gentle curves
- Pastel-colored text
- Airy spacing

## Character Guidelines
- Soft, rounded features
- Gentle expressions
- Pastel clothing palette
- Cute but not childish
- Consistent soft aesthetic
- Light skin tones
- Soft hair colors
- Kawaii or gentle realism
- CONTINUITY: Same character must have identical face, hair color, and outfit across ALL clips
- CONTINUITY: Maintain consistent pastel color palette and features throughout

## Background & Environment
- Soft gradient backgrounds
- Dreamy clouds
- Gentle nature scenes
- Cozy interiors
- Soft bokeh effects
- Minimal harsh edges
- Floating elements

## Mood & Atmosphere
- Calm, peaceful
- Dreamy, soft
- Gentle, nurturing
- Sweet, pleasant
- Meditative quiet
- Romantic softness
- Therapeutic calm

## Lighting
- Soft, diffused light
- No harsh shadows
- Gentle gradients
- Glowing highlights
- Overcast day quality
- Soft studio lighting
- No strong contrast

## Narration Style
- Gentle, soothing voice
- Calm, measured pace
- Soft vocabulary
- Peaceful delivery
- ASMR-adjacent quality
- Kind, nurturing tone
- Unhurried rhythm

## Composition Rules
- Balanced, harmonious layouts
- Central or rule of thirds
- Breathing room
- Soft edges
- Gentle curves
- Floating elements
- Visual calm

## Image Prompt Additions
Always include: "pastel colors, soft aesthetic, dreamy atmosphere, gentle lighting, muted tones, calming visual, light and airy, subtle gradients, peaceful mood"

## Avoid
- High contrast
- Saturated colors
- Dark themes
- Sharp edges
- Harsh shadows
- Bold graphics
- Aggressive compositions
- Dramatic lighting`,

  "3b1b": `# 3Blue1Brown Style Guide

## Visual Characteristics
- Dark background (deep navy/black)
- Elegant mathematical animations
- Geometric shapes and constructions
- Smooth, continuous transformations
- Clean vector graphics
- LaTeX-style mathematical notation
- Manim animation aesthetic
- Educational clarity above all

## Color Palette
- Dark navy/black backgrounds (#1a1a2e or similar)
- 3Blue1Brown signature blue (#3b82f6)
- Warm golden/yellow accents (#f59e0b)
- Pure white for primary elements
- Soft gradients for depth
- Primary: deep blue, golden yellow, white
- Secondary: teal, coral, purple for variety
- Mathematical objects: distinct colors per concept
- Text: white or light cream on dark

## Typography
- Clean sans-serif for narration text
- LaTeX-style for mathematical formulas
- Consistent, readable sizing
- White text on dark backgrounds
- Mathematical symbols rendered beautifully
- No decorative fonts
- Clear hierarchy for equations

## Character Guidelines
- Abstract geometric representations
- Pi creatures (circular characters) optional
- Mathematical objects as "characters"
- Vectors, matrices, functions personified
- Consistent visual language for concepts
- No realistic human characters
- Shapes that transform and interact

## Background & Environment
- Pure dark backgrounds
- Coordinate grids when relevant
- Number lines and axes
- Abstract mathematical spaces
- 3D coordinate systems
- Clean, uncluttered canvas
- Focus entirely on the math

## Mood & Atmosphere
- Intellectual curiosity
- Wonder at mathematical beauty
- Calm, focused exploration
- "Aha moment" building
- Elegant simplicity
- Deep understanding over memorization
- Approachable complexity

## Lighting
- Self-illuminated objects
- Glowing mathematical elements
- No realistic lighting
- Objects emit their own light
- Soft glows for emphasis
- Dark background makes colors pop

## Narration Style
- Thoughtful, measured pacing
- Building intuition step by step
- "Let's think about this..."
- Questions that lead to insights
- Never condescending
- Genuine enthusiasm for math
- Clear, precise explanations
- Pause for visual demonstrations

## Composition Rules
- Center stage for main concepts
- Transformations happen smoothly
- Multiple views when helpful
- Build complexity gradually
- Visual hierarchy through size/color
- Mathematical elegance in layout
- Space for formulas and diagrams

## Image Prompt Additions
Always include: "3blue1brown style, dark background, mathematical visualization, elegant geometry, clean vector graphics, educational animation, glowing mathematical objects, deep navy background"

## Avoid
- Cluttered compositions
- Realistic imagery
- Bright/white backgrounds
- Cartoonish elements
- Rushed explanations
- Decorative elements
- Complex textures
- Photorealistic anything`,

  corporate: `# Corporate Style Guide

## Visual Characteristics
- Professional, polished aesthetic
- Clean, modern design language
- Brand-appropriate imagery
- Stock photo quality illustrations
- Infographic elements
- Charts and data visualization
- Business context imagery
- High production value

## Color Palette
- Professional blues and grays
- Corporate brand colors
- Conservative, trustworthy tones
- Primary: navy blue, slate gray, white
- Secondary: teal, burgundy, gold accents
- Accent: orange or green for CTAs
- Backgrounds: white, light gray, subtle gradients
- Text: dark gray, never pure black

## Typography
- Professional sans-serif fonts
- Clean, readable headlines
- Consistent brand fonts
- Clear hierarchy
- No decorative or playful fonts
- Proper spacing and alignment
- Bullet points and lists
- Executive summary style

## Character Guidelines
- Professional diverse people
- Business attire
- Confident, approachable expressions
- Office/meeting contexts
- Handshakes, collaboration scenes
- Gender and ethnic diversity
- Age diversity
- Authentic, not overly staged
- CONTINUITY: Same professional must have identical face, attire, and features across ALL clips
- CONTINUITY: Maintain consistent hair, skin tone, and outfit colors throughout video

## Background & Environment
- Modern office spaces
- Conference rooms
- Urban skylines
- Clean workspaces
- Technology in context
- Professional settings
- Neutral, non-distracting
- Global/international feel

## Mood & Atmosphere
- Professional confidence
- Trustworthy, reliable
- Forward-thinking
- Collaborative spirit
- Results-oriented
- Innovative yet stable
- Global perspective

## Lighting
- Professional studio lighting
- Bright, optimistic
- No harsh shadows
- Natural office lighting
- Clean, even illumination
- Slight warmth for approachability

## Narration Style
- Professional, authoritative
- Clear, concise language
- Business vocabulary
- Confident but not arrogant
- Data-driven statements
- Action-oriented
- Stakeholder-aware
- Executive-level communication

## Composition Rules
- Clean, organized layouts
- Rule of thirds
- White space for breathing
- Clear visual hierarchy
- Data front and center
- Professional framing
- Balanced, stable compositions

## Image Prompt Additions
Always include: "corporate style, professional business aesthetic, modern office, clean design, trustworthy, polished presentation, executive quality, business context"

## Avoid
- Casual or playful elements
- Overly creative designs
- Cluttered compositions
- Unprofessional imagery
- Outdated stock photo style
- Cheesy business clichés
- Poor diversity representation
- Overly formal/stiff poses`,

  presentation: `# Presentation Style Guide

## Visual Characteristics
- Slide deck aesthetic
- Clean, focused layouts
- One idea per frame
- Supporting visuals
- Key points highlighted
- Progressive disclosure
- Template consistency
- Keynote/PowerPoint quality

## Color Palette
- Clean, professional colors
- Consistent color scheme throughout
- Accent color for emphasis
- Primary: white/light backgrounds
- Secondary: brand colors
- Accent: single highlight color
- Text: dark gray or navy
- Backgrounds: white, light gray, subtle gradients

## Typography
- Large, readable headlines
- Bullet point formatting
- Sans-serif body text
- Bold for emphasis
- Consistent sizing
- Maximum 3 font sizes
- Clear hierarchy
- Adequate line spacing

## Character Guidelines
- Icons over photographs
- Simple person icons
- Isotype-style figures
- Minimal detail
- Consistent icon style
- Gender-neutral when possible
- Action-oriented poses
- Professional context

## Background & Environment
- Minimal backgrounds
- Solid colors or subtle gradients
- No distracting patterns
- Clean white space
- Geometric accents optional
- Professional, not busy
- Consistent across slides

## Mood & Atmosphere
- Clear and focused
- Professional
- Educational
- Engaging
- Action-oriented
- Memorable takeaways
- Conference-ready

## Lighting
- Flat, clean lighting
- No shadows on backgrounds
- Icons self-lit
- No atmospheric effects
- High contrast for readability
- Screen-optimized

## Narration Style
- Clear, structured delivery
- Key points emphasized
- "First... Second... Third..."
- Actionable takeaways
- Executive summary style
- Question and answer ready
- Time-conscious

## Composition Rules
- One concept per slide
- Title at top
- Supporting visual center
- Key points as bullets
- Consistent margins
- Aligned elements
- White space is essential

## Image Prompt Additions
Always include: "presentation slide style, clean layout, professional design, keynote aesthetic, single concept focus, white space, clear hierarchy, business presentation"

## Avoid
- Cluttered slides
- Too much text
- Inconsistent styling
- Distracting animations
- Poor contrast
- Busy backgrounds
- Multiple concepts per frame
- Decorative elements`,

  tech: `# Tech/Startup Style Guide

## Visual Characteristics
- Modern, innovative aesthetic
- Gradient backgrounds
- Glassmorphism effects
- Abstract geometric shapes
- Device mockups
- UI/UX screenshots
- Product-focused imagery
- Silicon Valley aesthetic

## Color Palette
- Modern gradient combinations
- Purple to blue gradients
- Tech startup colors
- Primary: electric purple, tech blue, vibrant teal
- Secondary: hot pink, lime green, orange
- Gradients: purple-blue, pink-orange, teal-green
- Backgrounds: dark mode preferred, or light with gradients
- Accent: neon highlights

## Typography
- Modern geometric sans-serif
- Inter, SF Pro, Poppins style
- Bold headlines
- Clean body text
- Tech-forward fonts
- Monospace for code
- Product Sans aesthetic
- Rounded, friendly letterforms

## Character Guidelines
- Diverse, young professionals
- Casual tech workplace attire
- Collaborative scenes
- Device interaction
- Remote work contexts
- Startup culture imagery
- Inclusive representation
- Authentic, not corporate
- CONTINUITY: Same person must have identical face, hair, and style across ALL clips
- CONTINUITY: Maintain consistent clothing colors and accessories throughout video

## Background & Environment
- Modern tech offices
- Co-working spaces
- Abstract gradient backgrounds
- Product interfaces
- Code on screens
- Startup environments
- Home office setups
- Tech conference vibes

## Mood & Atmosphere
- Innovative, forward-thinking
- Exciting, energetic
- Disruptive
- Growth-oriented
- Community-driven
- Mission-focused
- Optimistic about future

## Lighting
- Soft, modern lighting
- Gradient glows
- Screen-lit faces
- Neon accents
- Blue hour aesthetic
- Device glow effects
- Contemporary office lighting

## Narration Style
- Energetic, passionate
- Startup pitch energy
- "We're building..."
- Vision-focused
- User-centric language
- Tech vocabulary
- Fast-paced but clear
- Inspiring, motivational

## Composition Rules
- Asymmetric balance
- Floating UI elements
- Device mockup focus
- Gradient overlays
- Modern grid systems
- Depth through blur
- Hero image style

## Image Prompt Additions
Always include: "tech startup style, modern gradient, glassmorphism, innovative aesthetic, product-focused, silicon valley vibe, contemporary design, device mockups"

## Avoid
- Outdated tech imagery
- Corporate stiffness
- Stock photo clichés
- Old interface designs
- Boring presentations
- Traditional layouts
- Skeuomorphic design
- Dated color schemes`,
};

const CLIP_TYPE_GUIDES: Record<ClipType, string> = {
  intro: `# Intro Clip Guidelines

## Purpose
- Hook the viewer immediately
- Establish the topic and tone
- Create anticipation for what's coming
- Set visual style expectations

## Visual Approach
- Bold, attention-grabbing composition
- Title or topic prominently featured
- Establish the visual world of the video
- High impact, memorable imagery
- Style-defining visuals

## Narration Style
- Engaging opening hook or question
- Brief preview of what viewers will learn
- Confident, welcoming tone
- Keep it concise (5-10 seconds typical)
- Create curiosity

## Composition Rules
- Central focal point
- Title text integration welcome
- Clean, uncluttered background
- Strong visual hierarchy

## Image Prompt Additions
Include: "bold composition, welcoming, establishing shot, high visual impact, opening scene"

## Avoid
- Starting with details before context
- Overly busy compositions
- Weak or generic openings
- Lengthy narration
- Meta-labels like "intro clip", "chapter 1", "section" in the image`,

  content: `# Content Clip Guidelines

## Purpose
- Deliver main educational content
- Illustrate concepts visually
- Support narration with imagery
- Build understanding progressively

## Visual Approach
- Detailed, informative illustrations
- Show concepts, not just tell
- Visual metaphors and diagrams welcome
- Character interactions if applicable
- Data visualization when relevant

## Narration Style
- Clear explanation of concepts
- Conversational but informative
- Build on previous clips
- 10-20 seconds typical
- Use examples and analogies

## Composition Rules
- Focus on the concept being explained
- Support text labels when helpful
- Show relationships and processes
- Maintain visual continuity with prior clips

## Image Prompt Additions
Include: "educational illustration, concept visualization, informative, detailed scene, narrative moment, explanatory visual"

## Avoid
- Purely decorative imagery
- Visuals that contradict narration
- Overcrowded compositions
- Breaking visual continuity`,

  outro: `# Outro Clip Guidelines

## Purpose
- Provide satisfying conclusion
- Summarize key takeaways
- Create memorable final impression
- Optional call-to-action

## Visual Approach
- Return to establishing visual style
- Sense of completion and closure
- Can echo intro imagery
- Celebratory or reflective mood
- Full-circle visual callback

## Narration Style
- Brief summary of key points
- Memorable closing statement
- Thank viewer or encourage action
- 5-10 seconds typical
- End on strong note

## Composition Rules
- Clean, conclusive composition
- Space for end card elements
- Visual callback to intro welcome
- Strong final image

## Image Prompt Additions
Include: "conclusion style, closing shot, satisfying ending, memorable finale, wrap-up visual, callback to intro"

## Avoid
- Introducing new concepts
- Weak or abrupt endings
- Overly long summaries
- Visuals unrelated to content`,
};

export function getStyleGuide(style: Style): string {
  return STYLE_GUIDES[style];
}

export function getStylePromptAdditions(style: Style): string {
  const guide = getStyleGuide(style);
  const match = guide.match(
    /## Image Prompt Additions\n(?:Always include: |Include: )?"([^"]+)"/
  );
  return match?.[1] ?? "";
}

export function getStyleAvoidList(style: Style): string[] {
  const guide = getStyleGuide(style);
  const avoidSection = guide.match(/## Avoid\n([\s\S]*?)(?:\n##|$)/);
  if (!avoidSection) return [];

  return avoidSection[1]
    .split("\n")
    .filter((line) => line.startsWith("- "))
    .map((line) => line.slice(2).trim());
}

export function getClipTypeGuide(clipType: ClipType): string {
  return CLIP_TYPE_GUIDES[clipType];
}

export function getClipTypePromptAdditions(clipType: ClipType): string {
  const guide = getClipTypeGuide(clipType);
  const match = guide.match(
    /## Image Prompt Additions\n(?:Include: )?"([^"]+)"/
  );
  return match?.[1] ?? "";
}

export function getClipTypeAvoidList(clipType: ClipType): string[] {
  const guide = getClipTypeGuide(clipType);
  const avoidSection = guide.match(/## Avoid\n([\s\S]*?)(?:\n##|$)/);
  if (!avoidSection) return [];

  return avoidSection[1]
    .split("\n")
    .filter((line) => line.startsWith("- "))
    .map((line) => line.slice(2).trim());
}
