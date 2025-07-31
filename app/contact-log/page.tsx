'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, User, MapPin, Clock } from 'lucide-react';
import { useContacts } from '@/hooks/use-contacts';

export default function ContactLogPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<string>('all');
  const [selectedService, setSelectedService] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  
  const { contacts, loading, error, refetch } = useContacts({
    search: searchTerm,
    provider: selectedProvider === 'all' ? undefined : selectedProvider,
    service: selectedService === 'all' ? undefined : selectedService,
    dateFilter: dateFilter === 'all' ? undefined : dateFilter
  });

  const providers = Array.from(new Set(contacts.map(c => c.provider).filter(Boolean)));
  const services = Array.from(new Set(
    contacts.flatMap(c => 
      c.services_received ? c.services_received.split(',').map(s => s.trim()) : []
    )
  ));

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getServiceBadgeVariant = (service: string) => {
    const serviceColors: Record<string, string> = {
      'Shower': 'bg-blue-100 text-blue-800',
      'Laundry': 'bg-purple-100 text-purple-800',
      'Meal': 'bg-green-100 text-green-800',
      'Clothing': 'bg-yellow-100 text-yellow-800',
      'Case Management': 'bg-red-100 text-red-800',
      'Medical': 'bg-pink-100 text-pink-800',
      'Housing': 'bg-indigo-100 text-indigo-800'
    };
    
    return serviceColors[service] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading contact log...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center text-red-600">Error: {error}</div>
        <Button onClick={refetch} className="mt-4">Retry</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Contact Log</h1>
        <p className="text-muted-foreground">
          Complete history of all client contacts and services
        </p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Search</label>
              <Input
                placeholder="Search by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Provider</label>
              <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Providers</SelectItem>
                  {providers.map(provider => (
                    <SelectItem key={provider} value={provider}>
                      {provider}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Service</label>
              <Select value={selectedService} onValueChange={setSelectedService}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Services</SelectItem>
                  {services.map(service => (
                    <SelectItem key={service} value={service}>
                      {service}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Date Range</label>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="mb-4">
        <p className="text-sm text-muted-foreground">
          Showing {contacts.length} contact{contacts.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Contact List */}
      <div className="space-y-4">
        {contacts.map((contact) => (
          <Card key={contact.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-semibold">{contact.name}</h3>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {formatDate(contact.contact_date)}
                </div>
              </div>
              
              {contact.provider && (
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{contact.provider}</span>
                </div>
              )}
              
              {contact.services_received && (
                <div className="mb-2">
                  <p className="text-sm font-medium mb-1">Services:</p>
                  <div className="flex flex-wrap gap-1">
                    {contact.services_received.split(',').map((service, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary"
                        className={getServiceBadgeVariant(service.trim())}
                      >
                        {service.trim()}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {contact.notes && (
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium mb-1">Notes:</p>
                  <p>{contact.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        
        {contacts.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No contacts found matching your filters.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
