exports.learningPathprompt = (skills) => {
    return `Given the following user skills: ${skills.join(', ')}, generate a personalized, progressive tech learning path.

            Format the output as clearly labeled steps using the structure below. Each step must include both:
            1. A short **title** on the first line (prefixed with "Step N: ")
            2. A **description** on the next line(s)

            Separate each step with two newlines (\n\n) so it's easy to split for UI rendering.

            Example format:
            Step 1: [Short Title]
            [Detailed description here.]

            Step 2: [Short Title]
            [Detailed description here.]

            Continue in this format up to 6–8 steps depending on depth. `
}