class Playlist < ActiveRecord::Base
  belongs_to :user

  validates :user_id, presence: true
  validates :play_order, presence: true
  validates :content_id, presence: true

  def self.next(user_id, current_order)
    order("play_order").find_by("user_id = ? AND play_order > ?", user_id, current_order)
  end

  def self.prev(user_id, current_order)
    order("play_order").reverse_order.find_by("user_id = ? AND play_order < ?", user_id, current_order)
  end

  def self.last(user_id)
    order("play_order").reverse_order.find_by("user_id = ?", user_id)
  end

  def self.around(user_id)
    order("play_order").where("user_id = ?", user_id)
  end

end
