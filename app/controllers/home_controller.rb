class HomeController < ApplicationController
  def index
    @user = User.find(current_user.id)
    @current_order = @user.current;
  end
end
