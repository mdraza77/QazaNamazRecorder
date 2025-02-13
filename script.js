document.addEventListener("DOMContentLoaded", () => {
    const counters = document.querySelectorAll(".counter")
    const totalCount = document.getElementById("total-count")
    const targetInput = document.getElementById("target-input")
    const setTargetButton = document.getElementById("set-target")
    const showUpdatesButton = document.getElementById("show-updates")
    const modal = document.getElementById("updateModal")
    const closeModal = document.querySelector(".close")
    const updateTimesDiv = document.getElementById("update-times")
    let target = 0
    const counterTargets = {}
    let completedCounters = new Set()
    let lastUpdateTimes = {}

    const counterOrder = ["Fajr", "Zohr", "Asr", "Maghrib", "Isha", "Witr"]

    function updateCounter(input, value) {
      input.value = value
      updateTotal()
      saveToLocalStorage()
      animateValue(input)
      checkCounterTarget(input, true)
      updateLastUpdateTime(input.closest(".counter").dataset.name)
    }

    function updateTotal() {
      const total = Array.from(counters).reduce((sum, counter) => {
        return sum + Number.parseInt(counter.querySelector("input").value)
      }, 0)
      animateValue(totalCount, Number.parseInt(totalCount.textContent), total, 500)
    }

    function saveToLocalStorage() {
      const values = Array.from(counters).map((counter) => {
        return counter.querySelector("input").value
      })
      localStorage.setItem("counter-values", JSON.stringify(values))
      localStorage.setItem("target-value", target)
      localStorage.setItem("completed-counters", JSON.stringify(Array.from(completedCounters)))
      localStorage.setItem("last-update-times", JSON.stringify(lastUpdateTimes))
    }

    function loadFromLocalStorage() {
      const savedValues = JSON.parse(localStorage.getItem("counter-values"))
      const savedTarget = localStorage.getItem("target-value")
      const savedCompletedCounters = JSON.parse(localStorage.getItem("completed-counters"))
      const savedLastUpdateTimes = JSON.parse(localStorage.getItem("last-update-times"))
      if (savedValues) {
        counters.forEach((counter, index) => {
          counter.querySelector("input").value = savedValues[index] || 0
        })
        updateTotal()
      }
      if (savedTarget) {
        target = Number.parseInt(savedTarget)
        targetInput.value = target
        updateCounterLabels()
      }
      if (savedCompletedCounters) {
        completedCounters = new Set(savedCompletedCounters)
      }
      if (savedLastUpdateTimes) {
        lastUpdateTimes = savedLastUpdateTimes
      }
    }

    function animateValue(element, start, end, duration) {
      let startTimestamp = null
      const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp
        const progress = Math.min((timestamp - startTimestamp) / duration, 1)
        const value = Math.floor(progress * (end - start) + start)
        element.textContent = value
        if (progress < 1) {
          window.requestAnimationFrame(step)
        }
      }
      window.requestAnimationFrame(step)
    }

    function setTarget() {
      const newTarget = Number.parseInt(targetInput.value)
      if (newTarget && newTarget > 0) {
        target = newTarget
        updateCounterLabels()
        saveToLocalStorage()
        counters.forEach((counter) => {
          const input = counter.querySelector("input")
          checkCounterTarget(input, false)
        })
      }
    }

    function updateCounterLabels() {
      counters.forEach((counter) => {
        const input = counter.querySelector("input")
        const label = counter.querySelector("label")
        const name = counter.dataset.name
        counterTargets[name] = target || 0
        label.textContent = `${name}: ${input.value}/${counterTargets[name] || 0}`
      })
    }

    function checkCounterTarget(input, showAlert) {
      const counter = input.closest(".counter")
      const name = counter.dataset.name
      const value = Number.parseInt(input.value)
      const label = counter.querySelector("label")

      if (counterTargets[name] && value >= counterTargets[name]) {
        if (value === counterTargets[name] && !completedCounters.has(name) && showAlert) {
          alert(`Masha'Allah! You have successfully completed all your ${name} qaza namaz.`)
          completedCounters.add(name)
          saveToLocalStorage()
        }
        label.style.color = "#27ae60"
      } else {
        label.style.color = "#34495e"
        completedCounters.delete(name)
        saveToLocalStorage()
      }

      label.textContent = `${name}: ${value}/${counterTargets[name] || 0}`
    }

    function updateLastUpdateTime(counterName) {
      const now = new Date()
      lastUpdateTimes[counterName] = {
        date: now.toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" }),
        time: now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true }),
      }
      saveToLocalStorage()
    }

    function showLastUpdateTimes() {
      updateTimesDiv.innerHTML = ""
      counterOrder.forEach((counterName) => {
        const updateInfo = lastUpdateTimes[counterName] || { date: "-", time: "-" }
        const updateTimeItem = document.createElement("div")
        updateTimeItem.className = "update-time-item"
        updateTimeItem.innerHTML = `
                <h3>${counterName}</h3>
                <p>Date: ${updateInfo.date}</p>
                <p>Time: ${updateInfo.time}</p>
              `
        updateTimesDiv.appendChild(updateTimeItem)
      })
      modal.style.display = "block"
    }

    counters.forEach((counter) => {
      const input = counter.querySelector("input")
      const incrementBtn = counter.querySelector(".increment")
      const decrementBtn = counter.querySelector(".decrement")

      incrementBtn.addEventListener("click", () => {
        updateCounter(input, Number.parseInt(input.value) + 1)
      })

      decrementBtn.addEventListener("click", () => {
        if (Number.parseInt(input.value) > 0) {
          updateCounter(input, Number.parseInt(input.value) - 1)
        }
      })
    })

    setTargetButton.addEventListener("click", setTarget)
    showUpdatesButton.addEventListener("click", showLastUpdateTimes)

    closeModal.addEventListener("click", () => {
      modal.style.display = "none"
    })

    window.addEventListener("click", (event) => {
      if (event.target === modal) {
        modal.style.display = "none"
      }
    })

    loadFromLocalStorage()
    updateCounterLabels()
  })

  const currentYear = new Date().getFullYear(); // Get the current year
  console.log(currentYear); // Print the current year to the console
  document.getElementById('curr_year').innerText = currentYear;