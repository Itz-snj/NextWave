"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableCaption
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import { Loader2, PlusCircle, MoreHorizontal, Pencil, Trash2, UploadCloud, Image as ImageIcon } from 'lucide-react';

// --- Venue Form Component ---
function VenueForm({ initial, onSubmit, loading }: any) {
  const form = useForm({ defaultValues: initial });
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField name="name" control={form.control} render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Venue Name</FormLabel>
              <FormControl><Input placeholder="e.g. Pro Sports Arena" {...field} required /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField name="location" control={form.control} render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Location</FormLabel>
              <FormControl><Input placeholder="e.g. Salt Lake, Kolkata" {...field} required /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          
          <FormField name="description" control={form.control} render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Description</FormLabel>
              <FormControl><Textarea placeholder="A short description of your venue..." {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField name="sportsText" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Sports Offered</FormLabel>
              <FormControl>
                <Input placeholder="Badminton, Tennis" {...field} />
              </FormControl>
               <p className="text-xs text-muted-foreground">Enter sports separated by commas.</p>
              <FormMessage />
            </FormItem>
          )} />

          <FormField name="numCourts" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Number of Courts</FormLabel>
              <FormControl>
                <Input type="number" min={1} {...field} required onChange={(e) => field.onChange(Number(e.target.value))}/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          
          <FormField name="priceRange.min" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Min Price (₹)</FormLabel>
              <FormControl>
                <Input type="number" step="10" min="0" {...field} required onChange={(e) => field.onChange(Number(e.target.value))} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField name="priceRange.max" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Max Price (₹)</FormLabel>
              <FormControl>
                <Input type="number" step="10" min="0" {...field} required onChange={(e) => field.onChange(Number(e.target.value))} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>
        <p className="text-xs text-muted-foreground pt-4">
          New venues are created as Pending. They become visible to users after admin approval.
        </p>
        <DialogFooter>
          <Button type="submit" disabled={loading} className="w-full sm:w-auto">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Saving..." : "Save Venue"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

// --- Main Page Component ---
export default function FacilitiesPage() {
  const { user } = useAuth();
  const [venues, setVenues] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editVenue, setEditVenue] = useState<any>(null);
  const [imagesDialog, setImagesDialog] = useState<{ open: boolean; venue: any | null }>({ open: false, venue: null });
  
  // Enhanced loading states
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [deletingVenue, setDeletingVenue] = useState<string | null>(null);
  const [removingImage, setRemovingImage] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);

  // Fetch venues for this owner
  useEffect(() => {
    if (!user) return;
    setInitialLoading(true);
    fetch("/api/venues")
      .then(res => res.json())
      .then(data => {
        const ownerId = (user as any).id || (user as any)._id;
        setVenues(data.filter((v: any) => String(v.owner) === String(ownerId)));
      })
      .catch((error) => console.error('Failed to fetch venues:', error))
      .finally(() => setInitialLoading(false));
  }, [user]);

  const parseSports = (sportsText: string | undefined) => {
    return String(sportsText || "").split(",").map((s) => s.trim()).filter(Boolean);
  };

  const refreshVenues = () => {
    if (!user) return;
    const ownerId = (user as any).id || (user as any)._id;
    fetch("/api/venues")
      .then(res => res.json())
      .then(data => setVenues(data.filter((v: any) => String(v.owner) === String(ownerId))));
  }

  // Create or update venue
  const handleSubmit = async (data: any) => {
    if (!user) return;
    setLoading(true);
    const method = editVenue ? "PUT" : "POST";
    const url = editVenue ? `/api/venues/${editVenue._id}` : "/api/venues";

    const normalized: any = {
      ...data,
      priceRange: {
        min: Number(data?.priceRange?.min ?? 0),
        max: Number(data?.priceRange?.max ?? 0),
      },
      sports: parseSports(data?.sportsText),
      numCourts: Number(data?.numCourts ?? 1),
    };
    delete normalized.sportsText;

    const ownerId = (user as any).id || (user as any)._id;
    const body = editVenue ? normalized : { ...normalized, owner: ownerId, status: "pending", images: [] };

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error('Failed to save venue');

      const savedVenue = await res.json();
      
      // If new venue, create associated courts
      if (method === "POST" && savedVenue._id && normalized.numCourts > 0) {
        const sport = normalized.sports[0] || "General";
        await fetch('/api/courts/ensure', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            venue: savedVenue._id,
            count: normalized.numCourts,
            sport,
            basePricePerHour: normalized.priceRange.min || 0,
          }),
        });
      }

      setDialogOpen(false);
      setEditVenue(null);
      refreshVenues();
    } catch (error) {
      console.error('Submit failed:', error);
      alert('Failed to save venue. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Delete venue
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this venue? This action cannot be undone.')) return;
    setDeletingVenue(id);
    try {
      await fetch(`/api/venues/${id}`, { method: "DELETE" });
      setVenues(venues.filter((v: any) => v._id !== id));
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete venue. Please try again.');
    } finally {
      setDeletingVenue(null);
    }
  };

  const uploadImages = async (venue: any, files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    
    try {
      const validFiles = Array.from(files).slice(0, 3).filter(file => {
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return false;
        if (file.size > 5 * 1024 * 1024) return false; // 5MB limit
        return true;
      });

      if (validFiles.length === 0) throw new Error("No valid files selected.");

      const sigRes = await fetch('/api/uploads/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder: 'venues' }),
      });
      if (!sigRes.ok) throw new Error('Failed to get upload signature');
      const { timestamp, signature, apiKey, cloudName, folder } = await sigRes.json();

      const uploadPromises = validFiles.map(async file => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('api_key', apiKey);
        formData.append('timestamp', timestamp.toString());
        formData.append('signature', signature);
        formData.append('folder', folder);
        
        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: 'POST', body: formData });
        if (!res.ok) throw new Error(`Upload failed for ${file.name}`);
        const data = await res.json();
        return data.secure_url;
      });

      const urls = await Promise.all(uploadPromises);
      const nextImages = Array.from(new Set([...(venue.images || []), ...urls])).slice(0, 3);

      await fetch(`/api/venues/${venue._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images: nextImages }),
      });

      setVenues(prev => prev.map(v => (v._id === venue._id ? { ...v, images: nextImages } : v)));
      // Also update the venue in the dialog state
      setImagesDialog(prev => ({...prev, venue: {...prev.venue, images: nextImages}}));
    } catch (error) {
      console.error('Upload failed:', error);
      alert(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = async (venue: any, imageUrl: string) => {
    if (!confirm('Are you sure you want to remove this image?')) return;
    setRemovingImage(imageUrl);
    try {
      const nextImages = (venue.images || []).filter((u: string) => u !== imageUrl);
      await fetch(`/api/venues/${venue._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images: nextImages }),
      });
      
      setVenues(prev => prev.map(v => (v._id === venue._id ? { ...v, images: nextImages } : v)));
       // Also update the venue in the dialog state
      setImagesDialog(prev => ({...prev, venue: {...prev.venue, images: nextImages}}));
    } catch (error) {
      console.error('Failed to remove image:', error);
      alert('Failed to remove image. Please try again.');
    } finally {
      setRemovingImage(null);
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch(status) {
      case "approved": return <Badge variant="default" className="bg-green-500 hover:bg-green-600">Approved</Badge>;
      case "pending": return <Badge variant="outline">Pending</Badge>;
      case "rejected": return <Badge variant="destructive">Rejected</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Facilities</h1>
          <p className="text-muted-foreground">Add, edit, and manage your venues and courts.</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditVenue(null); setDialogOpen(true); }}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Venue
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[625px]">
            <DialogHeader>
              <DialogTitle>{editVenue ? "Edit Venue" : "Create a New Venue"}</DialogTitle>
              <DialogDescription>
                {editVenue ? "Update the details for your venue." : "Fill in the details below to add a new venue."}
              </DialogDescription>
            </DialogHeader>
            <VenueForm
              initial={editVenue ? { ...editVenue, sportsText: (editVenue?.sports || []).join(", ") } : { name: "", description: "", location: "", sportsText: "", numCourts: 1, priceRange: { min: 0, max: 0 } }}
              onSubmit={handleSubmit}
              loading={loading}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Images Dialog */}
      <Dialog open={imagesDialog.open} onOpenChange={(open) => setImagesDialog({ open, venue: open ? imagesDialog.venue : null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Photos for {imagesDialog.venue?.name}</DialogTitle>
            <DialogDescription>You can upload up to 3 images (JPG, PNG, WEBP). Max 5MB each.</DialogDescription>
          </DialogHeader>
          {imagesDialog.venue && (
            <div className="space-y-4">
               <div className="grid grid-cols-3 gap-4">
                {(imagesDialog.venue.images || []).map((url: string) => (
                  <div key={url} className="relative group aspect-square">
                    <img src={url} alt="Venue" className="w-full h-full object-cover rounded-md" />
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
                      <Button 
                        size="icon" variant="destructive" 
                        onClick={() => removeImage(imagesDialog.venue, url)}
                        disabled={removingImage === url}
                      >
                         {removingImage === url ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              
              {(imagesDialog.venue.images?.length || 0) < 3 && (
                <div className="mt-4">
                  <label className="relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <UploadCloud className="w-8 h-8 mb-2 text-muted-foreground" />
                      <p className="mb-2 text-sm text-muted-foreground">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                    </div>
                    <input 
                      type="file" 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      accept="image/png, image/jpeg, image/webp" 
                      multiple 
                      onChange={(e) => uploadImages(imagesDialog.venue, e.target.files)}
                      disabled={uploading}
                    />
                  </label>
                  {uploading && <div className="text-sm text-center mt-2">Uploading...</div>}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Venue</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Sports</TableHead>
                <TableHead>Courts</TableHead>
                <TableHead>Price (₹)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialLoading ? (
                <TableRow><TableCell colSpan={7} className="text-center h-24">Loading venues...</TableCell></TableRow>
              ) : venues.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center h-24">No venues found. Add your first one!</TableCell></TableRow>
              ) : (
                venues.map((venue: any) => (
                  <TableRow key={venue._id} className={deletingVenue === venue._id ? 'opacity-50' : ''}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-16 h-12 bg-muted rounded-md flex items-center justify-center cursor-pointer"
                          onClick={() => setImagesDialog({ open: true, venue })}
                        >
                          {venue.images && venue.images.length > 0 ? (
                            <img src={venue.images[0]} alt={venue.name} className="w-full h-full object-cover rounded-md" />
                          ) : (
                            <ImageIcon className="w-6 h-6 text-muted-foreground"/>
                          )}
                        </div>
                        <div>
                          <div className="font-bold">{venue.name}</div>
                          <div className="text-sm text-muted-foreground">{venue.location}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><p className="max-w-[250px] truncate">{venue.description || '-'}</p></TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {(venue.sports as string[]).slice(0, 3).map((s) => (
                          <Badge key={s} variant="secondary">{s}</Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">{venue?.courtCount ?? 0}</TableCell>
                    <TableCell>{`${venue?.priceRange?.min} - ${venue?.priceRange?.max}`}</TableCell>
                    <TableCell>{getStatusBadge(venue.status)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => { setEditVenue(venue); setDialogOpen(true); }}>
                            <Pencil className="mr-2 h-4 w-4" /> Edit Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setImagesDialog({ open: true, venue })}>
                            <ImageIcon className="mr-2 h-4 w-4" /> Manage Photos
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-500"
                            onClick={() => handleDelete(venue._id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete Venue
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}