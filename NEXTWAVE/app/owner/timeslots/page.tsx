"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";

export default function OwnerTimeSlotsPage() {
  const { user } = useAuth();
  const [venues, setVenues] = useState<any[]>([]);
  const [courts, setCourts] = useState<any[]>([]);
  const [selectedVenue, setSelectedVenue] = useState<string>("");
  const [selectedCourt, setSelectedCourt] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [slots, setSlots] = useState<any[]>([]);
  const [newTime, setNewTime] = useState("06:00");
  const [newPrice, setNewPrice] = useState<number>(0);
  const [ensuring, setEnsuring] = useState(false);

  const isWeekend = useMemo(() => {
    if (!selectedDate) return false;
    const day = selectedDate.getDay();
    return day === 0 || day === 6; // Sun or Sat
  }, [selectedDate]);

  useEffect(() => {
    if (!user) return;
    fetch("/api/venues")
      .then((r) => r.json())
      .then((data) => {
        const ownerId = (user as any).id || (user as any)._id;
        const mine = data.filter((v: any) => String(v.owner) === String(ownerId));
        setVenues(mine);
      });
  }, [user]);

  useEffect(() => {
    if (!selectedVenue) {
      setCourts([]);
      setSelectedCourt("");
      return;
    }
    fetch(`/api/courts?venue=${selectedVenue}`)
      .then(async (r) => {
        const text = await r.text();
        const parsed = text ? JSON.parse(text) : [] as any[];
        return Array.isArray(parsed) ? parsed : [];
      })
      .then((data) => {
        setCourts(data);
        // Auto-select first court if none selected
        if (data.length > 0) {
          const firstId = String(data[0]._id);
          setSelectedCourt((prev) => (prev ? prev : firstId));
        } else {
          setSelectedCourt("");
        }
      })
      .catch(() => {
        setCourts([]);
        setSelectedCourt("");
      });
  }, [selectedVenue]);

  const ensureCourtsForVenue = async () => {
    if (!selectedVenue) return;
    setEnsuring(true);
    try {
      // Try to create a default set of 2 courts using venue's min price as base price
      const venue = venues.find((v) => String(v._id) === String(selectedVenue));
      const basePrice = Number(venue?.priceRange?.min || 0);
      const sport = (venue?.sports && venue.sports[0]) || 'General';
      await fetch('/api/courts/ensure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ venue: selectedVenue, count: 2, sport, basePricePerHour: basePrice }),
      });
      // reload courts
      const res = await fetch(`/api/courts?venue=${selectedVenue}`);
      const data = await res.json();
      setCourts(Array.isArray(data) ? data : []);
      if (Array.isArray(data) && data.length > 0) setSelectedCourt(String(data[0]._id));
    } finally {
      setEnsuring(false);
    }
  };

  const loadSlots = async () => {
    if (!selectedVenue || !selectedCourt || !selectedDate) {
      setSlots([]);
      return;
    }
    try {
      const date = selectedDate.toISOString().slice(0, 10);
      // Request hides past slots automatically and cleans up past ones for today
      const res = await fetch(`/api/timeslots?venue=${selectedVenue}&court=${selectedCourt}&date=${date}&cleanup=1`);
      if (!res.ok) {
        setSlots([]);
        return;
      }
      const text = await res.text();
      if (!text) {
        setSlots([]);
        return;
      }
      const data = JSON.parse(text);
      setSlots(Array.isArray(data) ? data : []);
    } catch (_e) {
      setSlots([]);
    }
  };

  useEffect(() => {
    loadSlots();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedVenue, selectedCourt, selectedDate]);

  const createSlot = async () => {
    if (!selectedVenue || !selectedCourt || !selectedDate) return alert("Select venue, court and date");
    if (!/^\d{2}:\d{2}$/.test(newTime)) return alert("Time must be HH:mm");
    if (newPrice <= 0) return alert("Enter a valid price");
    const date = selectedDate.toISOString().slice(0, 10);
    const price = Number(newPrice || 0);
    const res = await fetch("/api/timeslots", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ venue: selectedVenue, court: selectedCourt, date, time: newTime, price, isAvailable: true }),
    });
    if (!res.ok) {
      const text = await res.text();
      try {
        const err = JSON.parse(text);
        alert(err.error || "Failed to create slot");
      } catch {
        alert("Failed to create slot");
      }
      return;
    }
    setNewTime("06:00");
    loadSlots();
  };

  const toggleAvailable = async (slot: any) => {
    console.log("Toggling slot", slot);
    await fetch(`/api/timeslots/${slot._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isAvailable: !slot.isAvailable }),
    });
    loadSlots();
  };

  const deleteSlot = async (slot: any) => {
    await fetch(`/api/timeslots/${slot._id}`, { method: "DELETE" });
    loadSlots();
  };

  return (
    <div className="max-w-6xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Manage Time Slots</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Setup</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Venue</label>
              <Select value={selectedVenue} onValueChange={(v) => { setSelectedVenue(v); setSelectedCourt(""); }}>
                <SelectTrigger><SelectValue placeholder="Select venue" /></SelectTrigger>
                <SelectContent>
                  {venues.map((v) => (
                    <SelectItem key={v._id} value={String(v._id)}>{v.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Court</label>
              <Select value={selectedCourt} onValueChange={setSelectedCourt} disabled={!selectedVenue}>
                <SelectTrigger><SelectValue placeholder="Select court" /></SelectTrigger>
                <SelectContent>
                  {courts.map((c) => (
                    <SelectItem key={c._id} value={String(c._id)}>
                      {c.name}{c.sport ? ` (${c.sport})` : ""}
                    </SelectItem>
                  ))}
                  {courts.length === 0 && (
                    <div className="px-3 py-2 text-sm text-muted-foreground">
                      No courts found for this venue.
                      <Button size="sm" className="ml-2" onClick={ensureCourtsForVenue} disabled={ensuring}>Create default courts</Button>
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Date</label>
              <div className="border rounded-md p-2">
                <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate as any} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedVenue && selectedCourt && selectedDate && (
        <Card>
          <CardHeader>
            <CardTitle>
              Slots for {selectedDate.toDateString()} {isWeekend && <span className="text-xs text-muted-foreground">(Weekend)</span>}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-end gap-3">
              <div>
                <label className="text-sm font-medium">Time (HH:mm)</label>
                <Input value={newTime} onChange={(e) => setNewTime(e.target.value)} placeholder="06:00" />
              </div>
              <div>
                <label className="text-sm font-medium">Price</label>
                <Input type="number" value={newPrice} onChange={(e) => setNewPrice(Number(e.target.value))} placeholder="500" />
                {isWeekend && <div className="text-xs text-muted-foreground mt-1">Tip: Set higher prices for weekends.</div>}
              </div>
              <Button onClick={createSlot}>Add Slot</Button>
            </div>

            <div className="grid md:grid-cols-4 gap-3">
              {slots.map((s) => (
                <div key={s._id} className={`border rounded-md p-3 ${s.isAvailable ? "" : "opacity-60"}`}>
                  <div className="font-semibold">{s.time}</div>
                  <div className="text-sm">₹{s.price}</div>
                  <div className="flex gap-2 mt-2">
                    <Button size="sm" variant="outline" onClick={() => toggleAvailable(s)}>{s.isAvailable ? "Disable" : "Enable"}</Button>
                    <Button size="sm" variant="destructive" onClick={() => deleteSlot(s)}>Delete</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
