import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, User, DollarSign, Home, TrendingUp, Users, CheckCircle, XCircle, FileText, Scale, Shield, AlertTriangle } from "lucide-react";

export default function CoBuyingScenario() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"model" | "legal" | "default">("model");

  return (
    <div className="min-h-screen bg-white">
      <div className="w-full px-6 md:px-12 lg:px-16 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 hover:bg-slate-100"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-4">
            Co-Buying Scenario
          </h1>
          <p className="text-xl text-slate-600 max-w-4xl">
            See how two buyers can team up to make homeownership possible
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-10">
          <div className="flex gap-3 bg-gradient-to-r from-slate-100 to-slate-50 p-2 rounded-xl shadow-md border-2 border-slate-200">
            <button
              onClick={() => setActiveTab("model")}
              className={`flex-1 px-8 py-6 text-lg font-bold rounded-lg transition-all duration-300 transform ${
                activeTab === "model"
                  ? "bg-gradient-to-r from-roomie-purple to-purple-600 text-white shadow-lg scale-105"
                  : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 hover:shadow-md"
              }`}
            >
              <div className="flex items-center justify-center gap-3">
                <TrendingUp className="h-7 w-7" />
                <span>Co-Buying Model</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab("legal")}
              className={`flex-1 px-8 py-6 text-lg font-bold rounded-lg transition-all duration-300 transform ${
                activeTab === "legal"
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg scale-105"
                  : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 hover:shadow-md"
              }`}
            >
              <div className="flex items-center justify-center gap-3">
                <Scale className="h-7 w-7" />
                <span>Exit & Legal Matters</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab("default")}
              className={`flex-1 px-8 py-6 text-lg font-bold rounded-lg transition-all duration-300 transform ${
                activeTab === "default"
                  ? "bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg scale-105"
                  : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 hover:shadow-md"
              }`}
            >
              <div className="flex items-center justify-center gap-3">
                <Shield className="h-7 w-7" />
                <span>Payment Default</span>
              </div>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "model" && (
          <div>

        {/* Introduction Section */}
        <Card className="mb-8 border border-slate-200 shadow-sm">
          <CardHeader className="bg-slate-50 border-b border-slate-200">
            <CardTitle className="text-2xl text-slate-900">Introduction</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="prose prose-slate max-w-none">
              <p className="text-lg leading-relaxed text-slate-700">
                Buying a condo in Toronto can feel impossible on your own — high prices, strict mortgage rules, 
                and monthly costs that stretch budgets to the limit.
              </p>
              <p className="text-lg leading-relaxed text-slate-700 mt-4">
                <strong>But what if you didn't have to go it alone?</strong>
              </p>
              <p className="text-lg leading-relaxed text-slate-700 mt-4">
                In the example below, we show how two buyers with similar situations can team up through 
                <span className="font-bold text-roomie-purple"> Homie AI</span> to make homeownership possible — 
                sharing costs, reducing risk, and opening up opportunities that would otherwise be out of reach.
              </p>
              <p className="text-lg leading-relaxed text-slate-700 mt-4">
                See how Michael and Alex navigate the numbers and explore what co-buying could look like for you.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Buyer Profiles */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">
            Profile of Buyers
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Michael's Profile */}
            <Card className="border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="bg-slate-50 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="bg-roomie-purple p-3 rounded-full">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-2xl text-slate-900">Michael</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <p className="text-slate-600 font-medium mb-2 text-base">Single, software engineer in Toronto</p>
                  <div className="space-y-2">
                    <p className="flex justify-between text-base">
                      <span className="text-slate-600">Annual income:</span>
                      <span className="font-bold text-slate-800">$70,000</span>
                    </p>
                    <p className="flex justify-between text-base">
                      <span className="text-slate-600">Monthly take-home:</span>
                      <span className="font-bold text-slate-800">~$4,200</span>
                      <span className="text-sm text-slate-500">(after ~25% tax)</span>
                    </p>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <p className="font-semibold text-slate-700 mb-3 text-base">Monthly expenses:</p>
                  <div className="space-y-2">
                    <p className="flex justify-between text-base">
                      <span className="text-slate-600">Rent:</span>
                      <span className="text-slate-800">$1,500</span>
                    </p>
                    <p className="flex justify-between text-base">
                      <span className="text-slate-600">Car:</span>
                      <span className="text-slate-800">$400</span>
                    </p>
                    <p className="flex justify-between text-base">
                      <span className="text-slate-600">Insurance:</span>
                      <span className="text-slate-800">$150</span>
                    </p>
                    <p className="flex justify-between text-base">
                      <span className="text-slate-600">Food + utilities + misc:</span>
                      <span className="text-slate-800">$800</span>
                    </p>
                    <p className="flex justify-between pt-2 border-t font-bold text-base">
                      <span className="text-green-700">Remaining disposable:</span>
                      <span className="text-green-700">~$1,350</span>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Alex's Profile */}
            <Card className="border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="bg-slate-50 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="bg-roomie-purple p-3 rounded-full">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-2xl text-slate-900">Alex</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <p className="text-slate-600 font-medium mb-2 text-base">Single, data analyst in Toronto</p>
                  <div className="space-y-2">
                    <p className="flex justify-between text-base">
                      <span className="text-slate-600">Annual income:</span>
                      <span className="font-bold text-slate-800">$65,000</span>
                    </p>
                    <p className="flex justify-between text-base">
                      <span className="text-slate-600">Monthly take-home:</span>
                      <span className="font-bold text-slate-800">~$3,900</span>
                    </p>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <p className="font-semibold text-slate-700 mb-3 text-base">Monthly expenses:</p>
                  <div className="space-y-2">
                    <p className="flex justify-between text-base">
                      <span className="text-slate-600">Rent:</span>
                      <span className="text-slate-800">$1,400</span>
                    </p>
                    <p className="flex justify-between text-base">
                      <span className="text-slate-600">Car:</span>
                      <span className="text-slate-800">$350</span>
                    </p>
                    <p className="flex justify-between text-base">
                      <span className="text-slate-600">Insurance:</span>
                      <span className="text-slate-800">$150</span>
                    </p>
                    <p className="flex justify-between text-base">
                      <span className="text-slate-600">Food + utilities + misc:</span>
                      <span className="text-slate-800">$800</span>
                    </p>
                    <p className="flex justify-between pt-2 border-t font-bold text-base">
                      <span className="text-green-700">Remaining disposable:</span>
                      <span className="text-green-700">~$1,200</span>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Scenario 1: Buying Alone */}
        <Card className="mb-8 border border-red-200 shadow-sm">
          <CardHeader className="bg-red-50 border-b border-red-200">
            <div className="flex items-center gap-3">
              <XCircle className="h-8 w-8 text-red-600" />
              <CardTitle className="text-2xl text-slate-900">Scenario 1: Buying Alone</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <p className="font-semibold text-slate-700 mb-2 text-lg">Michael wants to buy:</p>
                <div className="bg-slate-50 p-4 rounded-lg space-y-2">
                  <p className="flex justify-between text-base">
                    <span className="text-slate-600">Condo price:</span>
                    <span className="font-bold text-slate-800">$400,000</span>
                  </p>
                  <p className="flex justify-between text-base">
                    <span className="text-slate-600">Down payment (10%):</span>
                    <span className="font-bold text-slate-800">$40,000</span>
                  </p>
                  <p className="flex justify-between text-base">
                    <span className="text-slate-600">Mortgage needed:</span>
                    <span className="font-bold text-slate-800">$360,000</span>
                  </p>
                </div>
              </div>

              <div>
                <p className="font-semibold text-slate-700 mb-2 text-lg">Mortgage assumptions:</p>
                <div className="bg-slate-50 p-4 rounded-lg space-y-1">
                  <p className="text-slate-600 text-base">Rate: 6.5%</p>
                  <p className="text-slate-600 text-base">25-year amortization</p>
                </div>
              </div>

              <div>
                <p className="font-semibold text-slate-700 mb-2 text-lg">Monthly costs:</p>
                <div className="bg-slate-50 p-4 rounded-lg space-y-2">
                  <p className="flex justify-between text-base">
                    <span className="text-slate-600">Monthly mortgage payment:</span>
                    <span className="text-slate-800">~$2,580</span>
                  </p>
                  <p className="flex justify-between text-base">
                    <span className="text-slate-600">Condo fees:</span>
                    <span className="text-slate-800">$500</span>
                  </p>
                  <p className="flex justify-between text-base">
                    <span className="text-slate-600">Property tax:</span>
                    <span className="text-slate-800">$400</span>
                  </p>
                  <p className="flex justify-between pt-2 border-t font-bold text-lg">
                    <span className="text-red-700">Total monthly housing cost:</span>
                    <span className="text-red-700">$3,480</span>
                  </p>
                </div>
              </div>

              <div className="bg-red-50 border-2 border-red-200 p-6 rounded-lg">
                <p className="font-bold text-red-900 text-xl mb-3 flex items-center gap-2">
                  <XCircle className="h-6 w-6" />
                  Problem:
                </p>
                <div className="space-y-2 text-slate-700">
                  <p className="text-base">Michael's disposable income: <span className="font-bold text-green-700">~$1,350</span></p>
                  <p className="text-base">Required housing payment: <span className="font-bold text-red-700">$3,480</span></p>
                  <p className="text-lg font-bold text-red-900 mt-4">
                    ➡ Impossible alone without cutting all expenses drastically or waiting several years to save for downpayment.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Scenario 2: Co-Buying */}
        <Card className="mb-8 border border-green-200 shadow-sm">
          <CardHeader className="bg-green-50 border-b border-green-200">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <CardTitle className="text-2xl text-slate-900">Scenario 2: Co-Buying via Homie AI</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <p className="font-semibold text-slate-700 mb-2 text-lg">Michael meets Alex through Homie AI:</p>
                <div className="bg-slate-50 p-4 rounded-lg space-y-2">
                  <p className="flex justify-between text-base">
                    <span className="text-slate-600">Both can contribute for downpayment:</span>
                    <span className="font-bold text-slate-800">$20,000 each → total $40,000</span>
                  </p>
                  <p className="flex justify-between text-base">
                    <span className="text-slate-600">Condo price:</span>
                    <span className="font-bold text-slate-800">$400,000</span>
                  </p>
                  <p className="flex justify-between text-base">
                    <span className="text-slate-600">Each takes a 50% mortgage:</span>
                    <span className="font-bold text-slate-800">$180,000 each</span>
                  </p>
                </div>
              </div>

              <div>
                <p className="font-semibold text-slate-700 mb-2 text-lg">Monthly costs per person:</p>
                <div className="bg-slate-50 p-4 rounded-lg space-y-2">
                  <p className="flex justify-between text-base">
                    <span className="text-slate-600">Monthly mortgage payment:</span>
                    <span className="text-slate-800">~$1,290</span>
                  </p>
                  <p className="flex justify-between text-base">
                    <span className="text-slate-600">Condo fees:</span>
                    <span className="text-slate-800">$250</span>
                  </p>
                  <p className="flex justify-between text-base">
                    <span className="text-slate-600">Property tax:</span>
                    <span className="text-slate-800">$200</span>
                  </p>
                  <p className="flex justify-between pt-2 border-t font-bold text-lg">
                    <span className="text-green-700">Total per person monthly cost:</span>
                    <span className="text-green-700">~$1,740</span>
                  </p>
                </div>
              </div>

              <div className="bg-green-50 border-2 border-green-200 p-6 rounded-lg">
                <p className="font-bold text-green-900 text-xl mb-3 flex items-center gap-2">
                  <CheckCircle className="h-6 w-6" />
                  Impact:
                </p>
                <div className="space-y-2 text-slate-700">
                  <p className="text-base">Michael's disposable: <span className="font-bold">~$1,350</span> → still slightly tight, but manageable with minor adjustments (cutting subscriptions or small lifestyle adjustments)</p>
                  <p className="text-base">Alex's disposable: <span className="font-bold">~$1,200</span> → also manageable with minor adjustments</p>
                </div>
              </div>

              <div className="bg-roomie-purple/5 border border-roomie-purple/20 p-6 rounded-lg">
                <p className="font-bold text-roomie-purple text-xl mb-3 flex items-center gap-2">
                  <Users className="h-6 w-6" />
                  Outcome:
                </p>
                <ul className="space-y-2 text-slate-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-base">Condo purchase becomes financially possible</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-base">Risk is shared, exit rules can be pre-planned</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-base">Both have access to better neighborhoods and inventory that was impossible solo</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Comparison Table */}
        <Card className="mb-8 border border-slate-200 shadow-sm">
          <CardHeader className="bg-roomie-purple">
            <CardTitle className="text-2xl text-white">Visual Summary for Users</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="border border-slate-300 p-4 text-left font-bold text-slate-900 text-base">Metric</th>
                    <th className="border border-slate-300 p-4 text-center font-bold text-red-700 bg-red-50 text-base">
                      Buying Alone
                    </th>
                    <th className="border border-slate-300 p-4 text-center font-bold text-green-700 bg-green-50 text-base">
                      Co-Buying (Michael + Alex)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="border border-slate-300 p-4 font-semibold text-slate-700 text-base">
                      Down Payment Needed
                    </td>
                    <td className="border border-slate-300 p-4 text-center text-slate-800 text-base">
                      $40,000
                    </td>
                    <td className="border border-slate-300 p-4 text-center text-slate-800 bg-green-50 text-base">
                      $20,000 each
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="border border-slate-300 p-4 font-semibold text-slate-700 text-base">
                      Mortgage
                    </td>
                    <td className="border border-slate-300 p-4 text-center text-slate-800 text-base">
                      $360,000
                    </td>
                    <td className="border border-slate-300 p-4 text-center text-slate-800 bg-green-50 text-base">
                      $180,000 each
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="border border-slate-300 p-4 font-semibold text-slate-700 text-base">
                      Monthly Mortgage Payment
                    </td>
                    <td className="border border-slate-300 p-4 text-center text-slate-800 text-base">
                      $2,580
                    </td>
                    <td className="border border-slate-300 p-4 text-center text-slate-800 bg-green-50 text-base">
                      $1,290 each
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="border border-slate-300 p-4 font-semibold text-slate-700 text-base">
                      Condo Fees
                    </td>
                    <td className="border border-slate-300 p-4 text-center text-slate-800 text-base">
                      $500
                    </td>
                    <td className="border border-slate-300 p-4 text-center text-slate-800 bg-green-50 text-base">
                      $250 each
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="border border-slate-300 p-4 font-semibold text-slate-700 text-base">
                      Property Tax
                    </td>
                    <td className="border border-slate-300 p-4 text-center text-slate-800 text-base">
                      $400
                    </td>
                    <td className="border border-slate-300 p-4 text-center text-slate-800 bg-green-50 text-base">
                      $200 each
                    </td>
                  </tr>
                  <tr className="bg-slate-100 font-bold">
                    <td className="border border-slate-300 p-4 text-slate-900 text-base">
                      Total Monthly Housing
                    </td>
                    <td className="border border-slate-300 p-4 text-center text-red-700 text-xl">
                      $3,480
                    </td>
                    <td className="border border-slate-300 p-4 text-center text-green-700 text-xl bg-green-100">
                      $1,740 each
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="border border-slate-300 p-4 font-semibold text-slate-700 text-base">
                      Feasibility
                    </td>
                    <td className="border border-slate-300 p-4 text-center">
                      <span className="inline-flex items-center gap-2 text-red-700 font-bold text-base">
                        <XCircle className="h-5 w-5" />
                        Impossible
                      </span>
                    </td>
                    <td className="border border-slate-300 p-4 text-center bg-green-50">
                      <span className="inline-flex items-center gap-2 text-green-700 font-bold text-base">
                        <CheckCircle className="h-5 w-5" />
                        Manageable with shared risk
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="border border-slate-300 p-4 font-semibold text-slate-700 text-base">
                      Neighborhood Options
                    </td>
                    <td className="border border-slate-300 p-4 text-center text-slate-800 text-base">
                      Limited
                    </td>
                    <td className="border border-slate-300 p-4 text-center text-slate-800 bg-green-50 text-base">
                      Expanded
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="border border-slate-300 p-4 font-semibold text-slate-700 text-base">
                      Risk
                    </td>
                    <td className="border border-slate-300 p-4 text-center text-slate-800 text-base">
                      100% on Michael
                    </td>
                    <td className="border border-slate-300 p-4 text-center text-slate-800 bg-green-50 text-base">
                      Shared 50/50
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="border border-slate-300 p-4 font-semibold text-slate-700 text-base">
                      Exit Planning
                    </td>
                    <td className="border border-slate-300 p-4 text-center text-slate-800 text-base">
                      N/A
                    </td>
                    <td className="border border-slate-300 p-4 text-center text-slate-800 bg-green-50 text-base">
                      Structured via Homie AI
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="mt-8">
          <Button
            onClick={() => navigate('/dashboard/buying-opportunities?tab=co-ownership')}
            className="bg-roomie-purple hover:bg-roomie-purple/90 text-white px-8 py-6 text-lg font-bold shadow-md"
          >
            <Users className="h-5 w-5 mr-2" />
            Explore Co-Buying Opportunities
          </Button>
        </div>
          </div>
        )}

        {/* Exit & Legal Matters Tab Content */}
        {activeTab === "legal" && (
          <div>
            {/* Legal Framework Section */}
            <Card className="mb-10 border-2 border-slate-200 shadow-lg overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-roomie-purple to-purple-700 border-b-0">
                <CardTitle className="text-3xl text-white flex items-center gap-3">
                  <Scale className="h-8 w-8" />
                  Legal Framework for Co-Buying
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-8 px-8 pb-8">
                <div className="space-y-8">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-5">Types of Co-Ownership</h3>
                    <div className="space-y-5">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border-2 border-blue-200">
                        <h4 className="font-bold text-slate-900 text-xl mb-3 flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                          Tenancy in Common (TIC)
                        </h4>
                        <p className="text-lg text-slate-800 leading-relaxed">
                          Each owner holds a distinct share of the property (e.g., 50/50 or 60/40). Shares can be unequal and can be sold or transferred independently. If one owner passes away, their share goes to their estate, not automatically to the other owner.
                        </p>
                      </div>
                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border-2 border-purple-200">
                        <h4 className="font-bold text-slate-900 text-xl mb-3 flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-purple-600"></div>
                          Joint Tenancy
                        </h4>
                        <p className="text-lg text-slate-800 leading-relaxed">
                          All owners have equal shares and equal rights. If one owner passes away, their share automatically transfers to the surviving owner(s) through "right of survivorship." Cannot be transferred without consent of all parties.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-5">Essential Legal Documents</h3>
                    <div className="grid gap-4">
                      <div className="flex items-start gap-4 p-5 bg-white rounded-xl border-2 border-slate-200 hover:border-roomie-purple/50 transition-all">
                        <CheckCircle className="h-7 w-7 text-roomie-purple mt-1 flex-shrink-0" />
                        <div>
                          <span className="font-bold text-slate-900 text-lg block mb-1">Co-Ownership Agreement</span>
                          <span className="text-lg text-slate-700">Defines ownership percentages, financial responsibilities, decision-making processes, and exit strategies.</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-4 p-5 bg-white rounded-xl border-2 border-slate-200 hover:border-roomie-purple/50 transition-all">
                        <CheckCircle className="h-7 w-7 text-roomie-purple mt-1 flex-shrink-0" />
                        <div>
                          <span className="font-bold text-slate-900 text-lg block mb-1">Mortgage Agreement</span>
                          <span className="text-lg text-slate-700">Both parties are typically joint borrowers, meaning both are equally responsible for the full mortgage amount.</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-4 p-5 bg-white rounded-xl border-2 border-slate-200 hover:border-roomie-purple/50 transition-all">
                        <CheckCircle className="h-7 w-7 text-roomie-purple mt-1 flex-shrink-0" />
                        <div>
                          <span className="font-bold text-slate-900 text-lg block mb-1">Property Title</span>
                          <span className="text-lg text-slate-700">Legal document showing ownership structure (TIC or Joint Tenancy).</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-4 p-5 bg-white rounded-xl border-2 border-slate-200 hover:border-roomie-purple/50 transition-all">
                        <CheckCircle className="h-7 w-7 text-roomie-purple mt-1 flex-shrink-0" />
                        <div>
                          <span className="font-bold text-slate-900 text-lg block mb-1">Buy-Sell Agreement</span>
                          <span className="text-lg text-slate-700">Pre-determined terms for what happens if one party wants to exit.</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Exit Strategies Section */}
            <Card className="mb-10 border-2 border-slate-200 shadow-lg overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-emerald-600 to-teal-600 border-b-0">
                <CardTitle className="text-3xl text-white flex items-center gap-3">
                  <ArrowLeft className="h-8 w-8" />
                  Exit Strategies
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-8 px-8 pb-8">
                <div className="space-y-6">
                  <p className="text-xl text-slate-700 leading-relaxed">
                    Life changes, and co-buyers may need to exit the arrangement. Here are the most common exit strategies:
                  </p>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-7 rounded-xl border-2 border-emerald-300 hover:shadow-lg transition-all">
                      <h3 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3">
                        <div className="bg-emerald-600 p-3 rounded-lg">
                          <DollarSign className="h-7 w-7 text-white" />
                        </div>
                        Buyout
                      </h3>
                      <p className="text-lg text-slate-800 mb-4 leading-relaxed">
                        One co-owner buys out the other's share at an agreed-upon price (typically based on current market value).
                      </p>
                      <div className="bg-white p-4 rounded-lg border border-emerald-200">
                        <p className="text-base font-bold text-emerald-900 mb-1">Best for:</p>
                        <p className="text-base text-slate-700">When one party wants to keep the property and can afford to buy the other out.</p>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-7 rounded-xl border-2 border-blue-300 hover:shadow-lg transition-all">
                      <h3 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3">
                        <div className="bg-blue-600 p-3 rounded-lg">
                          <Home className="h-7 w-7 text-white" />
                        </div>
                        Sell the Property
                      </h3>
                      <p className="text-lg text-slate-800 mb-4 leading-relaxed">
                        Both parties agree to sell the property on the open market and split the proceeds according to their ownership percentage.
                      </p>
                      <div className="bg-white p-4 rounded-lg border border-blue-200">
                        <p className="text-base font-bold text-blue-900 mb-1">How to proceed:</p>
                        <p className="text-base text-slate-700">You can resell it on Homie AI platform or contact the team for assistance.</p>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-7 rounded-xl border-2 border-purple-300 hover:shadow-lg transition-all">
                      <h3 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3">
                        <div className="bg-purple-600 p-3 rounded-lg">
                          <FileText className="h-7 w-7 text-white" />
                        </div>
                        Refinancing
                      </h3>
                      <p className="text-lg text-slate-800 mb-4 leading-relaxed">
                        The remaining owner refinances the mortgage in their name only, removing the exiting party from the mortgage obligation.
                      </p>
                      <div className="bg-white p-4 rounded-lg border border-purple-200">
                        <p className="text-base font-bold text-purple-900 mb-1">Best for:</p>
                        <p className="text-base text-slate-700">When one party wants to keep the property and qualifies for a solo mortgage.</p>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-7 rounded-xl border-2 border-orange-300 hover:shadow-lg transition-all">
                      <h3 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3">
                        <div className="bg-orange-600 p-3 rounded-lg">
                          <Users className="h-7 w-7 text-white" />
                        </div>
                        Find a Replacement Co-Buyer
                      </h3>
                      <p className="text-lg text-slate-800 mb-4 leading-relaxed">
                        The exiting party finds a new co-buyer to take over their share, subject to approval from the remaining owner and lender.
                      </p>
                      <div className="bg-white p-4 rounded-lg border border-orange-200">
                        <p className="text-base font-bold text-orange-900 mb-1">Best for:</p>
                        <p className="text-base text-slate-700">When the remaining owner wants to continue co-owning but with a different partner.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Rights & Responsibilities Section */}
            <Card className="mb-10 border-2 border-slate-200 shadow-lg overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-indigo-600 to-blue-600 border-b-0">
                <CardTitle className="text-3xl text-white flex items-center gap-3">
                  <Shield className="h-8 w-8" />
                  Rights & Responsibilities
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-8 px-8 pb-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-7 rounded-xl border-2 border-green-200">
                    <h3 className="text-2xl font-bold text-green-800 mb-6 flex items-center gap-3">
                      <CheckCircle className="h-8 w-8" />
                      Your Rights
                    </h3>
                    <ul className="space-y-4">
                      <li className="flex items-start gap-3">
                        <div className="w-3 h-3 rounded-full bg-green-600 mt-2 flex-shrink-0"></div>
                        <span className="text-lg text-slate-800 leading-relaxed">Right to occupy and use the property according to your ownership share</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-3 h-3 rounded-full bg-green-600 mt-2 flex-shrink-0"></div>
                        <span className="text-lg text-slate-800 leading-relaxed">Right to sell or transfer your share (in TIC arrangements)</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-3 h-3 rounded-full bg-green-600 mt-2 flex-shrink-0"></div>
                        <span className="text-lg text-slate-800 leading-relaxed">Right to receive your share of rental income (if applicable)</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-3 h-3 rounded-full bg-green-600 mt-2 flex-shrink-0"></div>
                        <span className="text-lg text-slate-800 leading-relaxed">Right to participate in major decisions about the property</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-3 h-3 rounded-full bg-green-600 mt-2 flex-shrink-0"></div>
                        <span className="text-lg text-slate-800 leading-relaxed">Right to access financial records and property documents</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-7 rounded-xl border-2 border-amber-200">
                    <h3 className="text-2xl font-bold text-amber-800 mb-6 flex items-center gap-3">
                      <Shield className="h-8 w-8" />
                      Your Responsibilities
                    </h3>
                    <ul className="space-y-4">
                      <li className="flex items-start gap-3">
                        <div className="w-3 h-3 rounded-full bg-amber-600 mt-2 flex-shrink-0"></div>
                        <span className="text-lg text-slate-800 leading-relaxed">Pay your share of mortgage, property taxes, and insurance on time</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-3 h-3 rounded-full bg-amber-600 mt-2 flex-shrink-0"></div>
                        <span className="text-lg text-slate-800 leading-relaxed">Contribute to maintenance and repair costs as agreed</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-3 h-3 rounded-full bg-amber-600 mt-2 flex-shrink-0"></div>
                        <span className="text-lg text-slate-800 leading-relaxed">Maintain the property in good condition</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-3 h-3 rounded-full bg-amber-600 mt-2 flex-shrink-0"></div>
                        <span className="text-lg text-slate-800 leading-relaxed">Respect the co-owner's rights and agreed-upon terms</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-3 h-3 rounded-full bg-amber-600 mt-2 flex-shrink-0"></div>
                        <span className="text-lg text-slate-800 leading-relaxed">Liable for the full mortgage if co-owner defaults (joint liability)</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Dispute Resolution Section */}
            <Card className="mb-10 border-2 border-slate-200 shadow-lg overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-rose-600 to-pink-600 border-b-0">
                <CardTitle className="text-3xl text-white">Dispute Resolution</CardTitle>
              </CardHeader>
              <CardContent className="pt-8 px-8 pb-8">
                <p className="text-xl text-slate-700 mb-8 leading-relaxed">
                  Disagreements can happen. Here's how to handle them:
                </p>
                <div className="space-y-5">
                  <div className="flex items-start gap-5 p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border-2 border-blue-200 hover:shadow-lg transition-all">
                    <div className="bg-blue-600 text-white rounded-full w-14 h-14 flex items-center justify-center flex-shrink-0 font-bold text-2xl shadow-lg">
                      1
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-xl mb-2">Direct Communication</h4>
                      <p className="text-lg text-slate-700 leading-relaxed">Start with open, honest conversation between co-owners to resolve the issue.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-5 p-6 bg-gradient-to-r from-green-50 to-emerald-100 rounded-xl border-2 border-green-200 hover:shadow-lg transition-all">
                    <div className="bg-green-600 text-white rounded-full w-14 h-14 flex items-center justify-center flex-shrink-0 font-bold text-2xl shadow-lg">
                      2
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-xl mb-2">Mediation</h4>
                      <p className="text-lg text-slate-700 leading-relaxed">Homie AI offers premium, neutral mediation services to assist co-owners in resolving conflicts efficiently and fairly. Our expert-guided process helps parties find common ground, preserve relationships, and ensure smooth co-ownership management.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-5 p-6 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl border-2 border-purple-200 hover:shadow-lg transition-all">
                    <div className="bg-purple-600 text-white rounded-full w-14 h-14 flex items-center justify-center flex-shrink-0 font-bold text-2xl shadow-lg">
                      3
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-xl mb-2">Arbitration</h4>
                      <p className="text-lg text-slate-700 leading-relaxed">If mediation fails, an arbitrator makes a binding decision based on your co-ownership agreement.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-5 p-6 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl border-2 border-orange-200 hover:shadow-lg transition-all">
                    <div className="bg-orange-600 text-white rounded-full w-14 h-14 flex items-center justify-center flex-shrink-0 font-bold text-2xl shadow-lg">
                      4
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-xl mb-2">Legal Action</h4>
                      <p className="text-lg text-slate-700 leading-relaxed">As a last resort, co-ownership disputes can be resolved through the court system (partition action). Homie AI provides access to a professional legal team available 24/7, guiding co-owners through legal processes and ensuring that all matters are handled efficiently and with expert support.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Homie AI's Role Section */}
            <Card className="mb-10 border-2 border-slate-200 shadow-lg overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-roomie-purple to-purple-700 border-b-0">
                <CardTitle className="text-3xl text-white flex items-center gap-3">
                  <Users className="h-8 w-8" />
                  How Homie AI Helps
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-8 px-8 pb-8">
                <div className="space-y-6">
                  <p className="text-xl text-slate-700 leading-relaxed">
                    Homie AI provides comprehensive support throughout your co-buying journey:
                  </p>
                  <div className="space-y-5">
                    <div className="flex items-start gap-5 p-6 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl border-2 border-purple-200 hover:shadow-lg transition-all">
                      <div className="bg-roomie-purple p-3 rounded-lg flex-shrink-0">
                        <Users className="h-7 w-7 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-xl mb-2">Match with Compatible Co-Buyers</h4>
                        <p className="text-lg text-slate-700 leading-relaxed">Our algorithm connects you with potential partners who share similar financial goals and timelines.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-5 p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border-2 border-blue-200 hover:shadow-lg transition-all">
                      <div className="bg-blue-600 p-3 rounded-lg flex-shrink-0">
                        <FileText className="h-7 w-7 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-xl mb-2">Legal Document Templates</h4>
                        <p className="text-lg text-slate-700 leading-relaxed">Access professionally drafted co-ownership agreement templates tailored to Canadian law.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-5 p-6 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-xl border-2 border-emerald-200 hover:shadow-lg transition-all">
                      <div className="bg-emerald-600 p-3 rounded-lg flex-shrink-0">
                        <Scale className="h-7 w-7 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-xl mb-2">Legal Professional Network</h4>
                        <p className="text-lg text-slate-700 leading-relaxed">Connect with real estate lawyers who specialize in co-ownership arrangements.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-5 p-6 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl border-2 border-orange-200 hover:shadow-lg transition-all">
                      <div className="bg-orange-600 p-3 rounded-lg flex-shrink-0">
                        <TrendingUp className="h-7 w-7 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-xl mb-2">Exit Strategy Planning</h4>
                        <p className="text-lg text-slate-700 leading-relaxed">Tools and guidance to plan exit strategies before issues arise.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-5 p-6 bg-gradient-to-r from-pink-50 to-rose-100 rounded-xl border-2 border-pink-200 hover:shadow-lg transition-all">
                      <div className="bg-pink-600 p-3 rounded-lg flex-shrink-0">
                        <Shield className="h-7 w-7 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-xl mb-2">Ongoing Support</h4>
                        <p className="text-lg text-slate-700 leading-relaxed">Access to resources, educational content, and community forums throughout your co-ownership journey.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Call to Action */}
            <div className="mt-8">
              <Button
                onClick={() => navigate('/dashboard/buying-opportunities?tab=co-ownership')}
                className="bg-roomie-purple hover:bg-roomie-purple/90 text-white px-8 py-6 text-lg font-bold shadow-md"
              >
                <Users className="h-5 w-5 mr-2" />
                Start Your Co-Buying Journey
              </Button>
            </div>
          </div>
        )}

        {/* Co-Owner Payment Default Tab Content */}
        {activeTab === "default" && (
          <div>
            {/* Problem Definition Section */}
            <Card className="mb-10 border-2 border-red-200 shadow-lg overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-red-600 to-orange-600 border-b-0">
                <CardTitle className="text-3xl text-white flex items-center gap-3">
                  <AlertTriangle className="h-8 w-8" />
                  Problem Definition
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-8 px-8 pb-8">
                <div className="space-y-6">
                  <p className="text-xl text-slate-700 leading-relaxed">
                    In a co-ownership arrangement, all mortgage, condo fees, taxes, and related costs must be paid on time to the bank or relevant authority.
                  </p>
                  <div className="bg-red-50 border-2 border-red-200 p-6 rounded-xl">
                    <h3 className="text-2xl font-bold text-red-900 mb-4 flex items-center gap-2">
                      <AlertTriangle className="h-6 w-6" />
                      Key Challenges
                    </h3>
                    <ul className="space-y-4">
                      <li className="flex items-start gap-3">
                        <div className="w-3 h-3 rounded-full bg-red-600 mt-2 flex-shrink-0"></div>
                        <span className="text-lg text-slate-800 leading-relaxed">Banks only accept a single payment from the mortgage account; they do not track individual co-owner contributions.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-3 h-3 rounded-full bg-red-600 mt-2 flex-shrink-0"></div>
                        <span className="text-lg text-slate-800 leading-relaxed">If one co-owner cannot pay their share, the remaining co-owner(s) are legally responsible for the full payment.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-3 h-3 rounded-full bg-red-600 mt-2 flex-shrink-0"></div>
                        <span className="text-lg text-slate-800 leading-relaxed">Missed payments can lead to penalties, property arrears, and even foreclosure.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-3 h-3 rounded-full bg-red-600 mt-2 flex-shrink-0"></div>
                        <span className="text-lg text-slate-800 leading-relaxed">Conflicts arise, potentially escalating to legal disputes.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Homie AI Solution Section */}
            <Card className="mb-10 border-2 border-slate-200 shadow-lg overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-roomie-purple to-purple-700 border-b-0">
                <CardTitle className="text-3xl text-white flex items-center gap-3">
                  <Shield className="h-8 w-8" />
                  Homie AI Solution: Payment Default Management
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-8 px-8 pb-8">
                <div className="space-y-8">
                  {/* Step 1: Prevention & Pre-Screening */}
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-7 rounded-xl border-2 border-blue-200">
                    <h3 className="text-2xl font-bold text-slate-900 mb-5 flex items-center gap-3">
                      <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl">1</div>
                      Prevention & Pre-Screening
                    </h3>
                    <div className="space-y-4">
                      <div className="bg-white p-5 rounded-lg border border-blue-200">
                        <h4 className="font-bold text-slate-900 text-lg mb-2">Financial Compatibility Check</h4>
                        <p className="text-lg text-slate-700">Analyze income, debt-to-income ratio, credit score, and savings to assess payment reliability.</p>
                      </div>
                      <div className="bg-white p-5 rounded-lg border border-blue-200">
                        <h4 className="font-bold text-slate-900 text-lg mb-2">Contingency Fund / Escrow</h4>
                        <p className="text-lg text-slate-700">Require co-owners to deposit 1–2 months of payments into a Homie AI managed escrow.</p>
                      </div>
                      <div className="bg-white p-5 rounded-lg border border-blue-200">
                        <h4 className="font-bold text-slate-900 text-lg mb-2">Payment Agreement</h4>
                        <p className="text-lg text-slate-700">Formalize monthly contribution obligations in the co-ownership agreement, including consequences of non-payment.</p>
                      </div>
                    </div>
                  </div>

                  {/* Step 2: Automated Payment Tracking */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-7 rounded-xl border-2 border-green-200">
                    <h3 className="text-2xl font-bold text-slate-900 mb-5 flex items-center gap-3">
                      <div className="bg-green-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl">2</div>
                      Automated Payment Tracking
                    </h3>
                    <ul className="space-y-4">
                      <li className="flex items-start gap-3 bg-white p-5 rounded-lg border border-green-200">
                        <CheckCircle className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
                        <span className="text-lg text-slate-700">Homie AI tracks each co-owner's contribution in real-time.</span>
                      </li>
                      <li className="flex items-start gap-3 bg-white p-5 rounded-lg border border-green-200">
                        <CheckCircle className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
                        <span className="text-lg text-slate-700">Automated alerts and reminders are sent before the payment due date.</span>
                      </li>
                      <li className="flex items-start gap-3 bg-white p-5 rounded-lg border border-green-200">
                        <CheckCircle className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
                        <span className="text-lg text-slate-700">Internal dashboard shows co-owners who is on track and who is behind.</span>
                      </li>
                    </ul>
                  </div>

                  {/* Step 3: Mediation & Early Intervention */}
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-7 rounded-xl border-2 border-purple-200">
                    <h3 className="text-2xl font-bold text-slate-900 mb-5 flex items-center gap-3">
                      <div className="bg-purple-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl">3</div>
                      Mediation & Early Intervention
                    </h3>
                    <p className="text-lg text-slate-700 mb-4 leading-relaxed">
                      If a co-owner misses a payment, Homie AI automatically triggers high-end mediation between co-owners.
                    </p>
                    <div className="space-y-3">
                      <div className="bg-white p-5 rounded-lg border border-purple-200">
                        <p className="text-lg text-slate-700"><span className="font-bold">Option 1:</span> Temporary coverage by the other co-owner</p>
                      </div>
                      <div className="bg-white p-5 rounded-lg border border-purple-200">
                        <p className="text-lg text-slate-700"><span className="font-bold">Option 2:</span> Adjusted payment plan</p>
                      </div>
                      <div className="bg-white p-5 rounded-lg border border-purple-200">
                        <p className="text-lg text-slate-700"><span className="font-bold">Option 3:</span> Draw from emergency fund / contingency fund to make the payment</p>
                      </div>
                    </div>
                    <p className="text-lg text-slate-700 mt-4 italic">This prevents escalation and preserves the partnership.</p>
                  </div>

                  {/* Step 4: Contingency & Risk-Sharing Mechanisms */}
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-7 rounded-xl border-2 border-orange-200">
                    <h3 className="text-2xl font-bold text-slate-900 mb-5 flex items-center gap-3">
                      <div className="bg-orange-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl">4</div>
                      Contingency & Risk-Sharing Mechanisms
                    </h3>
                    <div className="space-y-4">
                      <div className="bg-white p-5 rounded-lg border border-orange-200">
                        <h4 className="font-bold text-slate-900 text-lg mb-2">Escrow / Virtual Payment Hub</h4>
                        <ul className="space-y-2 ml-4">
                          <li className="text-lg text-slate-700">• Co-owners deposit their share into Homie AI's platform account.</li>
                          <li className="text-lg text-slate-700">• Homie AI makes the single bank payment.</li>
                          <li className="text-lg text-slate-700">• Internal ledger keeps track of each co-owner's contribution.</li>
                        </ul>
                      </div>
                      <div className="bg-white p-5 rounded-lg border border-orange-200">
                        <h4 className="font-bold text-slate-900 text-lg mb-2">Insurance / Default Coverage (Optional)</h4>
                        <p className="text-lg text-slate-700">Platform can provide a small payment default insurance to cover temporary shortfalls.</p>
                      </div>
                    </div>
                  </div>

                  {/* Step 5: Exit & Legal Resolution */}
                  <div className="bg-gradient-to-br from-red-50 to-rose-100 p-7 rounded-xl border-2 border-red-200">
                    <h3 className="text-2xl font-bold text-slate-900 mb-5 flex items-center gap-3">
                      <div className="bg-red-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl">5</div>
                      Exit & Legal Resolution (Last Resort)
                    </h3>
                    <p className="text-lg text-slate-700 mb-4 leading-relaxed">
                      If payment default persists:
                    </p>
                    <div className="space-y-4">
                      <div className="bg-white p-5 rounded-lg border border-red-200">
                        <h4 className="font-bold text-slate-900 text-lg mb-2">Buyout Option</h4>
                        <p className="text-lg text-slate-700">Other co-owner(s) can buy out the defaulting co-owner at a pre-agreed formula.</p>
                      </div>
                      <div className="bg-white p-5 rounded-lg border border-red-200">
                        <h4 className="font-bold text-slate-900 text-lg mb-2">Partition / Court Action</h4>
                        <p className="text-lg text-slate-700">Legal team steps in if co-owner refuses to cooperate.</p>
                      </div>
                      <div className="bg-white p-5 rounded-lg border border-red-200">
                        <h4 className="font-bold text-slate-900 text-lg mb-2">24/7 Legal Support</h4>
                        <p className="text-lg text-slate-700">Homie AI provides 24/7 legal support, ensuring all steps are compliant and fair.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Call to Action */}
            <div className="mt-8">
              <Button
                onClick={() => navigate('/dashboard/buying-opportunities?tab=co-ownership')}
                className="bg-roomie-purple hover:bg-roomie-purple/90 text-white px-8 py-6 text-lg font-bold shadow-md"
              >
                <Shield className="h-5 w-5 mr-2" />
                Learn More About Payment Protection
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
