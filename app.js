class JokeApi {
    constructor() {
        this.jokeArea = document.querySelector(".joke-area")
        this.categoriesSelection = document.querySelector("#categories")
        this.typesSelection = document.querySelector("#types")
        this.submitButton = document.querySelector("#get-new-joke")
        this.safeMode = document.querySelector("#Safe-Mode")
        this.amount = document.querySelector("#amount")
        this.incDecAmount = document.querySelector(".number-input")
        this.selectedAmount = 1
        this.baseUrl = "https://v2.jokeapi.dev"
        this.jokes = []

        this.initialize()
    }

    async initialize() {
        try {
            this.validateElements()
            this.setupEventListeners()
            await this.getCategories()
            await this.getTypes()
            await this.fetchJokes()
        } catch (err) {
            console.error("Initialization error:", err)
        }
    }

    validateElements() {
        const elements = [
            this.jokeArea,
            this.categoriesSelection,
            this.typesSelection,
            this.submitButton,
            this.safeMode,
            this.amount,
        ]
        if (elements.some((el) => !(el instanceof HTMLElement))) {
            throw new Error("One or more elements are invalid")
        }
    }

    setupEventListeners() {
        this.submitButton?.addEventListener("click", async () => await this.fetchJokes())
        this.incDecAmount?.addEventListener("click", (e) => this.handleAmount(e))
    }

    /**
     * @param {Event} e
     */
    handleAmount(e) {
        if (
            !(e.target instanceof HTMLButtonElement) ||
            !(this.amount instanceof HTMLInputElement)
        ) {
            return
        }
        const value = e.target.innerText
        let targetValue = Number(this.amount.value)

        if (value === "-" && targetValue > 1) {
            this.amount.value = `${targetValue - 1}`
        } else if (value === "+" && targetValue < 10) {
            this.amount.value = `${targetValue + 1}`
        }
    }

    async getCategories() {
        if (!(this.categoriesSelection instanceof HTMLSelectElement)) {
            throw new Error("Invalid categories selection element")
        }
        try {
            const response = await fetch(`${this.baseUrl}/categories`)
            const data = await response.json()
            const { categories } = data
            this.categoriesSelection.innerHTML = ""
            categories.forEach((category) => {
                if (!(this.categoriesSelection instanceof HTMLSelectElement)) {
                    throw new Error("Invalid categories selection element")
                }
                const option = new Option(
                    category,
                    category,
                    category === "Any",
                    category === "Any"
                )
                if (option.value === "Any") option.text = "Any (Category)"
                this.categoriesSelection.appendChild(option)
            })
        } catch (err) {
            console.error("Error fetching categories:", err)
        }
    }

    async getTypes() {
        if (!(this.typesSelection instanceof HTMLSelectElement)) {
            throw new Error("Invalid types selection element")
        }
        try {
            const response = await fetch(`${this.baseUrl}/info`)
            const data = await response.json()
            const { types } = data.jokes
            types.forEach((type) => {
                if (!(this.typesSelection instanceof HTMLSelectElement)) {
                    throw new Error("Invalid types selection element")
                }
                const option = new Option(type, type)
                this.typesSelection.appendChild(option)
            })
        } catch (err) {
            console.error("Error fetching types:", err)
        }
    }

    async fetchJokes() {
        if (
            !(this.categoriesSelection instanceof HTMLSelectElement) ||
            !(this.typesSelection instanceof HTMLSelectElement) ||
            !(this.safeMode instanceof HTMLInputElement) ||
            !(this.amount instanceof HTMLInputElement) ||
            !(this.jokeArea instanceof HTMLDivElement)
        ) {
            throw new Error("Invalid elements")
        }
        try {
            const category = this.categoriesSelection?.value || "Any"
            const type = this.typesSelection?.value || "any"
            const safeMode = this.safeMode?.checked ? "&safe-mode" : ""

            if (!this.amount.checkValidity()) {
                alert("Please enter a valid amount (1-10)")
                return
            }

            this.selectedAmount = Number(this.amount.value) || 1
            const requestUrl = `${this.baseUrl}/joke/${category}?amount=${this.selectedAmount
                }${type === "any" ? "" : `&type=${type}`}${safeMode}`

            // Show loading indicator
            this.jokeArea.innerHTML = "<p>Loading jokes...</p>"

            const response = await fetch(requestUrl)
            const data = await response.json()

            this.jokes = data.jokes || [data]
            this.renderJokes()
        } catch (error) {
            console.error("Error fetching jokes:", error)
            this.jokeArea.innerHTML =
                "<p>Error fetching jokes. Please try again later.</p>"
        }
    }

    renderJokes() {
        if (!(this.jokeArea instanceof HTMLDivElement)) {
            throw new Error("Invalid joke area element")
        }
        this.jokeArea.innerHTML = ""
        const ul = document.createElement("ul")
        ul.setAttribute("type", "none")

        this.jokes.forEach((joke) => {
            const li = document.createElement("li")
            li.innerHTML =
                joke.type === "single"
                    ? `${joke.joke} <br/><span>[Category]: ${joke.category
                    } | [NSFW]: ${!joke.safe}</span><br/><br/><hr><br/>`
                    : `[Setup]: ${joke.setup} <br/>[Delivery]: ${joke.delivery
                    } <br/><span>[Category]: ${joke.category
                    } | [NSFW]: ${!joke.safe}</span><br/><br/><hr><br/>`
            ul.appendChild(li)
        })

        this.jokeArea.appendChild(ul)
    }
}

new JokeApi()
