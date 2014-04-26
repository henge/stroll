class Playlist < ActiveRecord::Base
  validates :play_order, presence: true
  validates :content_id, presence: true

  def self.next(current_order)
    order("play_order").find_by("play_order > ?", current_order)
  end

  def self.prev(current_order)
    order("play_order").reverse_order.find_by("play_order < ?", current_order)
  end

  def self.last
    order("play_order").reverse_order.find_by("1 = 1")
  end

  def self.around(current_order)
    order("play_order").where("1=1")
  end

end
