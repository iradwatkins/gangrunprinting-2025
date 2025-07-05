import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, Filter, Calendar, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useCustomerFeedback } from '@/hooks/useCrm';
import type { CustomerFeedback } from '@/types/crm';

export const CustomerFeedback: React.FC = () => {
  const { feedback, loading, getFeedback, createFeedback } = useCustomerFeedback();
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newFeedback, setNewFeedback] = useState({
    customer_id: '',
    order_id: '',
    rating: 5,
    comment: '',
    category: 'overall' as const
  });

  useEffect(() => {
    getFeedback();
  }, []);

  const handleCreateFeedback = async () => {
    if (!newFeedback.customer_id || newFeedback.rating < 1 || newFeedback.rating > 5) {
      return;
    }

    try {
      await createFeedback(newFeedback);
      setShowCreateDialog(false);
      setNewFeedback({
        customer_id: '',
        order_id: '',
        rating: 5,
        comment: '',
        category: 'overall'
      });
    } catch (error) {
      console.error('Error creating feedback:', error);
    }
  };

  const renderStars = (rating: number, interactive = false, onRatingChange?: (rating: number) => void) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-300'
            } ${interactive ? 'cursor-pointer' : ''}`}
            onClick={() => interactive && onRatingChange?.(star)}
          />
        ))}
      </div>
    );
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'product': return 'bg-blue-100 text-blue-800';
      case 'service': return 'bg-green-100 text-green-800';
      case 'shipping': return 'bg-purple-100 text-purple-800';
      case 'overall': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'text-green-600';
    if (rating >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  const filteredFeedback = feedback.filter(item => {
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesRating = ratingFilter === 'all' || item.rating.toString() === ratingFilter;
    return matchesCategory && matchesRating;
  });

  const averageRating = feedback.length > 0 
    ? feedback.reduce((sum, item) => sum + item.rating, 0) / feedback.length 
    : 0;

  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: feedback.filter(item => item.rating === rating).length,
    percentage: feedback.length > 0 ? (feedback.filter(item => item.rating === rating).length / feedback.length) * 100 : 0
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Customer Feedback</h2>
          <p className="text-gray-600">Monitor customer satisfaction and reviews</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <MessageSquare className="w-4 h-4 mr-2" />
                Add Feedback
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Customer Feedback</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Customer ID</label>
                  <input
                    type="text"
                    value={newFeedback.customer_id}
                    onChange={(e) => setNewFeedback({...newFeedback, customer_id: e.target.value})}
                    className="w-full p-2 border rounded"
                    placeholder="Customer ID"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Order ID (Optional)</label>
                  <input
                    type="text"
                    value={newFeedback.order_id}
                    onChange={(e) => setNewFeedback({...newFeedback, order_id: e.target.value})}
                    className="w-full p-2 border rounded"
                    placeholder="Order ID"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Rating</label>
                  <div className="mt-1">
                    {renderStars(newFeedback.rating, true, (rating) => 
                      setNewFeedback({...newFeedback, rating})
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <Select value={newFeedback.category} onValueChange={(value: any) => setNewFeedback({...newFeedback, category: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="overall">Overall</SelectItem>
                      <SelectItem value="product">Product</SelectItem>
                      <SelectItem value="service">Service</SelectItem>
                      <SelectItem value="shipping">Shipping</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Comment</label>
                  <Textarea
                    value={newFeedback.comment}
                    onChange={(e) => setNewFeedback({...newFeedback, comment: e.target.value})}
                    placeholder="Customer feedback..."
                    rows={3}
                  />
                </div>
                <div className="flex space-x-2">
                  <Button onClick={handleCreateFeedback}>Add Feedback</Button>
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold">{averageRating.toFixed(1)}</span>
              {renderStars(Math.round(averageRating))}
            </div>
            <p className="text-xs text-gray-500 mt-1">From {feedback.length} reviews</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{feedback.length}</div>
            <p className="text-xs text-gray-500 mt-1">Customer reviews</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Satisfaction Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {feedback.length > 0 ? 
                `${Math.round((feedback.filter(item => item.rating >= 4).length / feedback.length) * 100)}%` : 
                '0%'
              }
            </div>
            <p className="text-xs text-gray-500 mt-1">4+ star ratings</p>
          </CardContent>
        </Card>
      </div>

      {/* Rating Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Rating Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {ratingDistribution.map(({ rating, count, percentage }) => (
              <div key={rating} className="flex items-center space-x-4">
                <div className="flex items-center space-x-1 w-16">
                  <span className="text-sm">{rating}</span>
                  <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="text-sm text-gray-600 w-12 text-right">{count}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Feedback Reviews</CardTitle>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="overall">Overall</SelectItem>
                  <SelectItem value="product">Product</SelectItem>
                  <SelectItem value="service">Service</SelectItem>
                  <SelectItem value="shipping">Shipping</SelectItem>
                </SelectContent>
              </Select>
              <Select value={ratingFilter} onValueChange={setRatingFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ratings</SelectItem>
                  <SelectItem value="5">5 Stars</SelectItem>
                  <SelectItem value="4">4 Stars</SelectItem>
                  <SelectItem value="3">3 Stars</SelectItem>
                  <SelectItem value="2">2 Stars</SelectItem>
                  <SelectItem value="1">1 Star</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading feedback...</div>
          ) : filteredFeedback.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No feedback found</div>
          ) : (
            <div className="space-y-4">
              {filteredFeedback.map((item) => (
                <div key={item.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-3">
                      {renderStars(item.rating)}
                      <Badge className={getCategoryColor(item.category)}>
                        {item.category}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-500 flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(item.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    Customer: {item.customer_profiles?.user_profiles?.full_name || 'Unknown'}
                    {item.order_id && (
                      <span className="ml-2">• Order: #{item.order_id}</span>
                    )}
                  </div>
                  
                  {item.comment && (
                    <p className="text-sm">{item.comment}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};