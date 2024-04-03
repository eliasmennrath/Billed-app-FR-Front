/**
 * @jest-environment jsdom
 */

import {fireEvent, screen, waitFor} from "@testing-library/dom"
import Bills from "../containers/Bills.js";
import mockedBills from "../__mocks__/store.js";
import { ROUTES, ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";

import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills"
import userEvent from "@testing-library/user-event";
import mockStore from "../__mocks__/store";


import router from "../app/Router.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router(mockedBills);
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //to-do write expect expression
      expect(windowIcon.classList.contains('active-icon'));

    })
    test("Then bills should be ordered from earliest to latest", async() => {
      const Bill = new Bills({
        document, onNavigate, store: mockedBills, localStorage: null
      });
      const bills = await Bill.getBills()
      const dates = bills.map(bill => bill.date)
      const antiChrono = (a, b) => ((a.date < b.date) ? 1 : -1)
      const datesSorted = dates.sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })
  describe("When I click on the NewBill button", () => {
    test("Then I should be redirected to NewBill page", () => {

      document.body.innerHTML = BillsUI({data : bills})

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const bill = new Bills({
        document, onNavigate, store: mockedBills, localStorage: null
      })
      const handleClickNewBill = jest.fn((e) => bill.handleClickNewBill(e))
      const newBillButton = screen.getByTestId("btn-new-bill")
      newBillButton.addEventListener("click", handleClickNewBill)
      fireEvent.click(newBillButton)
      expect(handleClickNewBill).toHaveBeenCalled()

      expect(screen.getByText('Envoyer une note de frais')).toBeTruthy()
    })
  })

  describe('When I click on the icon eye', () => {
    test('A modal should open', () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))

      document.body.innerHTML = BillsUI({data : bills})

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const store = null
      const bill = new Bills({
        document, onNavigate, store, bills, localStorage: window.localStorage
      })

      $.fn.modal = jest.fn(() => document.getElementById("modaleFile").classList.add("show"));

      const handleClickIconEye = jest.fn((icon) => bill.handleClickIconEye(icon))
      const eyes = screen.getAllByTestId('icon-eye')
      eyes[0].addEventListener('click', handleClickIconEye(eyes[0]))
      userEvent.click(eyes[0])
      expect(handleClickIconEye).toHaveBeenCalled()

      const modale = document.getElementById('modaleFile')
      expect(modale.classList.contains("show")).toBeTruthy();
    })
  })
})


describe("When I am on the NewBill page and the API returns an error", ()=> {
  test("The API returns a 404 error", () => {
    jest.mock("../app/store", () => mockedBills)

    jest.spyOn(console, "error").mockImplementation(() => {});
    jest.spyOn(mockedBills, "bills");

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: 'a@a'
      }))

      mockedBills.bills.mockImplementationOnce(() => {
        return {
          list: () => {
            return Promise.reject(new Error("Erreur 404"));
          },
            };
      });

      
      try {
        const root = document.createElement("div");
        root.setAttribute("id", "root");
        document.body.appendChild(root);
        router(mockedBills);
        window.onNavigate(ROUTES_PATH.Bills);
      } catch(error) {
        expect(error).toMatch(/Error 404/)
      }

      jest.clearAllMocks();
  })
  test("The API returns a 500 error", () => {
    jest.mock("../app/store", () => mockedBills)

    jest.spyOn(console, "error").mockImplementation(() => {});
    jest.spyOn(mockedBills, "bills");

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: 'a@a'
      }))

      mockedBills.bills.mockImplementationOnce(() => {
        return {
          list: () => {
            return Promise.reject(new Error("Erreur 500"));
          },
            };
      });

      
      try {
        const root = document.createElement("div");
        root.setAttribute("id", "root");
        document.body.appendChild(root);
        router(mockedBills);
        window.onNavigate(ROUTES_PATH.Bills);
      } catch(error) {
        expect(error).toMatch(/Error 500/)
      }

      jest.clearAllMocks();
  })
});
